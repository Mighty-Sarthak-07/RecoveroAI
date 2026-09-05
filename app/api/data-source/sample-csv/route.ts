import { NextResponse } from "next/server";

export async function GET() {
  const csvContent = [
    "transaction_id,customer_name,customer_email,customer_phone,amount,currency,status,failure_reason,payment_method,workflow_type,customer_ltv",
    "TXN-8091,Rahul Sharma,rahul.sharma@example.com,+919876543210,2499,INR,failed,insufficient_funds,card,payment_failure,34986",
    "TXN-8092,Acme Corp Ltd,billing@acmecorp.in,+919822334455,12999,INR,failed,card_declined,card,subscription_failure,155988",
    "TXN-8093,Priya Singh,priya.singh@example.com,+919812345678,1299,INR,abandoned,checkout_abandoned,upi,checkout_abandonment,12990",
    "INV-9401,Nexus Logistics India,accounts@nexuslogistics.com,+919844556677,45000,INR,overdue,overdue_18d,invoice,b2b_receivable,240000",
    "MND-3021,Anand Varma,anand.varma@fintech.co,+919933445566,3500,INR,failed,insufficient_balance,nach,mandate_retry,42000",
    "TXN-8094,Neha Verma,neha.verma@techcorp.in,+919833445566,4099,INR,failed,authentication_failed,upi,voice_recovery,18990",
    "TXN-8095,Vikram Malhotra,vikram.m@investments.org,+919877665544,200000,INR,failed,policy_risk_trigger,netbanking,payment_failure,500000",
    "TXN-8096,Kavita Krishnan,kavita.k@designstudio.in,+919811223344,1850,INR,failed,gateway_timeout,card,payment_failure,22000",
    "INV-9402,Zenith Retailers,finance@zenithretail.in,+919866778899,28500,INR,overdue,overdue_14d,invoice,b2b_receivable,180000",
    "MND-3022,Rohan Deshmukh,rohan.d@cloudservices.io,+919855667788,4999,INR,failed,mandate_limit_exceeded,nach,mandate_retry,65000",
  ].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="recovero_sample_transactions.csv"',
    },
  });
}
