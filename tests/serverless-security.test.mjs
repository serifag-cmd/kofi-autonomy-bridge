import test from "node:test";
import assert from "node:assert/strict";
import metrics from "../api/metrics.js";
import lead from "../api/lead.js";
import opportunity from "../api/opportunity.js";

function res() {
  return { statusCode:200, headers:{}, body:null,
    setHeader(k,v){this.headers[k]=v;return this;},
    status(n){this.statusCode=n;return this;},
    json(v){this.body=v;return this;}
  };
}
const validLead={name:"Buyer",email:"buyer@example.test",business:"Studio",problem:"Slow lead response"};

test("public metrics rejects financial event types", async () => {
  const oldUrl=process.env.SUPABASE_URL, oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY, oldFetch=globalThis.fetch;
  let calls=0; globalThis.fetch=async()=>{calls++;return {ok:true,status:201};};
  process.env.SUPABASE_URL="https://db.example.test"; process.env.SUPABASE_SERVICE_ROLE_KEY="test-key";
  try {
    for (const type of ["payment","delivery","refund","renewal","pilot_started"]) {
      const r=res(); await metrics({method:"POST",body:{type,amount_eur:999}},r);
      assert.equal(r.statusCode,403,type);
    }
    assert.equal(calls,0);
  } finally {
    globalThis.fetch=oldFetch;
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("public metrics uses server identity and stores only bounded non-financial metadata", async () => {
  const oldUrl=process.env.SUPABASE_URL, oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY, oldFetch=globalThis.fetch;
  let stored; const before=Date.now();
  globalThis.fetch=async(url,opts)=>{stored=JSON.parse(opts.body);return {ok:true,status:201};};
  process.env.SUPABASE_URL="https://db.example.test"; process.env.SUPABASE_SERVICE_ROLE_KEY="test-key";
  try {
    const r=res();
    await metrics({method:"POST",body:{type:"qualified_visit",id:"forged",amount_eur:9999,occurred_at:"2000-01-01",experiment_id:"fake",metadata:{page:"rescue-kit",language:"en",email:"private@example.test"}}},r);
    assert.equal(r.statusCode,202); assert.equal(r.body.persisted,true);
    assert.notEqual(stored.id,"forged"); assert.equal(stored.type,"qualified_visit");
    assert.equal(stored.experiment_id,"everest-zero-rescue-kit"); assert.equal(stored.source,"public_telemetry");
    assert.equal("amount_eur" in stored,false);
    assert.ok(Date.parse(stored.occurred_at)>=before-1000);
    assert.deepEqual(stored.metadata,{page:"rescue-kit",language:"en"});
  } finally {
    globalThis.fetch=oldFetch;
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("metrics does not claim success when durable storage is unconfigured", async () => {
  const oldUrl=process.env.SUPABASE_URL, oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try { const r=res(); await metrics({method:"POST",body:{type:"qualified_visit"}},r);
    assert.equal(r.statusCode,503); assert.equal(r.body.error,"durable_storage_not_configured");
  } finally {
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("lead endpoint fails closed when no durable routing target exists", async () => {
  const oldTarget=process.env.AUTOMATION_TARGET_URL, oldFetch=globalThis.fetch;
  let calls=0; delete process.env.AUTOMATION_TARGET_URL; globalThis.fetch=async()=>{calls++;return {ok:true};};
  try { const r=res(); await lead({method:"POST",body:validLead},r);
    assert.equal(r.statusCode,503); assert.equal(r.body.error,"lead_storage_not_configured"); assert.equal(calls,0);
  } finally { globalThis.fetch=oldFetch; if(oldTarget===undefined) delete process.env.AUTOMATION_TARGET_URL; else process.env.AUTOMATION_TARGET_URL=oldTarget; }
});

test("lead endpoint validates email before forwarding", async () => {
  const oldTarget=process.env.AUTOMATION_TARGET_URL;
  process.env.AUTOMATION_TARGET_URL="https://automation.example.test/hook";
  try { const r=res(); await lead({method:"POST",body:{...validLead,email:"bad"}},r);
    assert.equal(r.statusCode,400); assert.equal(r.body.error,"invalid_email");
  } finally { if(oldTarget===undefined) delete process.env.AUTOMATION_TARGET_URL; else process.env.AUTOMATION_TARGET_URL=oldTarget; }
});

test("opportunity endpoint refuses anonymous and unverified payment claims", async () => {
  const old=process.env.EVEREST_VERIFIED_PAYMENT_TOKEN; delete process.env.EVEREST_VERIFIED_PAYMENT_TOKEN;
  try {
    const r=res(); await opportunity({method:"POST",headers:{},body:{amount:7.9,currency:"EUR",payment_status:"succeeded",test:false}},r);
    assert.equal(r.statusCode,503);
  } finally { if(old===undefined) delete process.env.EVEREST_VERIFIED_PAYMENT_TOKEN; else process.env.EVEREST_VERIFIED_PAYMENT_TOKEN=old; }
});

test("opportunity endpoint requires trusted credentials and a completed live payment", async () => {
  const old=process.env.EVEREST_VERIFIED_PAYMENT_TOKEN; process.env.EVEREST_VERIFIED_PAYMENT_TOKEN="test-only";
  try {
    const bad=res(); await opportunity({method:"POST",headers:{authorization:"Bearer wrong"},body:{}},bad);
    assert.equal(bad.statusCode,401);
    const pending=res(); await opportunity({method:"POST",headers:{authorization:"Bearer test-only"},body:{amount:7.9,currency:"EUR",payment_status:"processing",test:false,payment_id:"pi_test",product_id:"pet-portrait-v1"}},pending);
    assert.equal(pending.statusCode,422);
    const good=res(); await opportunity({method:"POST",headers:{authorization:"Bearer test-only"},body:{amount:7.9,currency:"EUR",payment_status:"succeeded",test:false,payment_id:"pi_live",product_id:"pet-portrait-v1"}},good);
    assert.equal(good.statusCode,200); assert.equal(good.body.payment_verified,true);
    assert.equal(good.body.job.payment.payment_id,"pi_live");
  } finally { if(old===undefined) delete process.env.EVEREST_VERIFIED_PAYMENT_TOKEN; else process.env.EVEREST_VERIFIED_PAYMENT_TOKEN=old; }
});


import kofiWebhook from "../api/kofi-webhook.js";

function kofiPayload(overrides = {}) {
  return {
    verification_token: "kofi-test-token",
    MessageID: "4f8f4b1c-83be-4bb4-9fb6-9ab7dd02cfa4",
    Type: "Shop Order",
    Amount: "9.90",
    Currency: "EUR",
    Timestamp: "2026-11-03T04:00:00.000Z",
    ShopItems: [{ item_name: "Freelancer Rescue Kit — Quote, Scope & Cashflow Pack", quantity: 1 }],
    ...overrides
  };
}

test("Ko-fi parses its form-encoded data field and persists matching Shop Orders idempotently", async () => {
  const oldToken=process.env.KOFI_VERIFICATION_TOKEN, oldUrl=process.env.SUPABASE_URL;
  const oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY, oldFetch=globalThis.fetch;
  let stored, prefer, targetUrl;
  process.env.KOFI_VERIFICATION_TOKEN="kofi-test-token";
  process.env.SUPABASE_URL="https://db.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY="service-role-test";
  delete process.env.AUTOMATION_TARGET_URL;
  globalThis.fetch=async(url,options)=>{
    targetUrl=String(url); prefer=options.headers.Prefer; stored=JSON.parse(options.body);
    return {ok:true,status:201};
  };
  try {
    const form=new URLSearchParams({data:JSON.stringify(kofiPayload())}).toString();
    const r=res(); await kofiWebhook({method:"POST",body:form},r);
    assert.equal(r.statusCode,200); assert.equal(r.body.persisted,true);
    assert.equal(stored.type,"payment"); assert.equal(stored.amount_eur,9.9);
    assert.equal(stored.experiment_id,"everest-zero-rescue-kit");
    assert.equal(stored.source,"kofi");
    assert.match(stored.id,/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(stored.metadata.item_name,"Freelancer Rescue Kit — Quote, Scope & Cashflow Pack");
    assert.equal(stored.metadata.evidence_status,"provider_webhook_received_pending_provider_reconciliation");
    assert.equal(prefer,"resolution=ignore-duplicates,return=minimal");
    assert.equal(targetUrl,"https://db.example.test/rest/v1/everest_events?on_conflict=id");
  } finally {
    globalThis.fetch=oldFetch;
    if(oldToken===undefined) delete process.env.KOFI_VERIFICATION_TOKEN; else process.env.KOFI_VERIFICATION_TOKEN=oldToken;
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("Ko-fi acknowledges non-Shop-Order payments without recording a product sale", async () => {
  const oldToken=process.env.KOFI_VERIFICATION_TOKEN, oldUrl=process.env.SUPABASE_URL;
  const oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY, oldFetch=globalThis.fetch;
  let calls=0;
  process.env.KOFI_VERIFICATION_TOKEN="kofi-test-token";
  process.env.SUPABASE_URL="https://db.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY="service-role-test";
  globalThis.fetch=async()=>{calls++;return {ok:true,status:201};};
  try {
    const r=res();
    await kofiWebhook({method:"POST",body:{...kofiPayload(),Type:"Donation",ShopItems:[]}},r);
    assert.equal(r.statusCode,200); assert.equal(r.body.ignored,true); assert.equal(calls,0);
  } finally {
    globalThis.fetch=oldFetch;
    if(oldToken===undefined) delete process.env.KOFI_VERIFICATION_TOKEN; else process.env.KOFI_VERIFICATION_TOKEN=oldToken;
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("Ko-fi refuses to acknowledge a matching paid Shop Order when durable storage is missing", async () => {
  const oldToken=process.env.KOFI_VERIFICATION_TOKEN, oldUrl=process.env.SUPABASE_URL;
  const oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.KOFI_VERIFICATION_TOKEN="kofi-test-token";
  delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const r=res();
    await kofiWebhook({method:"POST",body:kofiPayload()},r);
    assert.equal(r.statusCode,503); assert.equal(r.body.error,"durable_storage_not_configured"); assert.equal(r.body.retryable,true);
  } finally {
    if(oldToken===undefined) delete process.env.KOFI_VERIFICATION_TOKEN; else process.env.KOFI_VERIFICATION_TOKEN=oldToken;
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("Ko-fi refuses invalid verification tokens before persistence", async () => {
  const oldToken=process.env.KOFI_VERIFICATION_TOKEN, oldFetch=globalThis.fetch;
  let calls=0; process.env.KOFI_VERIFICATION_TOKEN="kofi-test-token";
  globalThis.fetch=async()=>{calls++;return {ok:true,status:201};};
  try {
    const r=res(); await kofiWebhook({method:"POST",body:kofiPayload({verification_token:"wrong"})},r);
    assert.equal(r.statusCode,401); assert.equal(calls,0);
  } finally {
    globalThis.fetch=oldFetch;
    if(oldToken===undefined) delete process.env.KOFI_VERIFICATION_TOKEN; else process.env.KOFI_VERIFICATION_TOKEN=oldToken;
  }
});
