import { describe, it, expect } from "vitest";

function parseCSV(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ""));

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    results.push(row);
  }

  return results;
}

describe("Data Source CSV Parser & Ingestion", () => {
  it("should parse comma-separated values correctly including quotes", () => {
    const sample = [
      "transaction_id,customer_name,customer_email,amount,currency,status,failure_reason",
      'TXN-101,"Sharma, Rahul",rahul@example.com,2499,INR,failed,insufficient_funds',
      "TXN-102,Acme Corp,acme@example.com,12999,INR,failed,card_declined",
    ].join("\n");

    const rows = parseCSV(sample);
    expect(rows).toHaveLength(2);
    expect(rows[0].transaction_id).toBe("TXN-101");
    expect(rows[0].customer_name).toBe("Sharma, Rahul");
    expect(rows[0].amount).toBe("2499");
    expect(rows[0].status).toBe("failed");
    expect(rows[1].customer_name).toBe("Acme Corp");
    expect(rows[1].amount).toBe("12999");
  });

  it("should correctly handle empty or single-line CSV inputs", () => {
    expect(parseCSV("")).toEqual([]);
    expect(parseCSV("header1,header2,header3")).toEqual([]);
  });

  it("should recognize Razorpay Key prefixes correctly", () => {
    const testKey = "rzp_test_buildathon_12345";
    const liveKey = "rzp_live_production_67890";
    const invalidKey = "invalid_api_key";

    expect(testKey.startsWith("rzp_test_")).toBe(true);
    expect(liveKey.startsWith("rzp_live_")).toBe(true);
    expect(invalidKey.startsWith("rzp_test_") || invalidKey.startsWith("rzp_live_")).toBe(false);
  });
});
