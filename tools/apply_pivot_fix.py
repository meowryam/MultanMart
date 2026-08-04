"""One-time fix: align products.json price/stock to PIVOT TABLE sheet.

- Keep only products that have a row in the PIVOT TABLE sheet.
- price = TP column, stock = QTY column from the pivot.
- Preserve existing name/category/brand/sku/image for kept products.
"""
import json
import openpyxl

ROOT = r"D:\MultanMart"
EXCEL = ROOT + r"\stock_in_hand 1.xlsx"
JSON = ROOT + r"\products.json"

wb = openpyxl.load_workbook(EXCEL, data_only=True)
ws = wb["PIVOT TABLE"]

pivot = {}
for row in ws.iter_rows(min_row=4, values_only=True):
    sku = str(row[2]) if row[2] is not None else ""
    if not sku.strip():
        continue
    qty = row[4]
    tp = row[5]
    pivot[sku] = {"qty": qty, "tp": tp}

print(f"Pivot unique SKUs: {len(pivot)}")

with open(JSON, "r", encoding="utf-8") as f:
    products = json.load(f)

kept = []
removed = []
for p in products:
    sku = str(p["sku"]).strip()
    pv = pivot.get(sku)
    if pv is None:
        removed.append(p)
        continue
    new_price = pv["tp"]
    new_stock = int(pv["qty"])
    # Normalize price to int when whole, else float
    if float(new_price).is_integer():
        new_price = int(new_price)
    else:
        new_price = round(float(new_price), 2)
    p["price"] = new_price
    p["stock"] = new_stock
    kept.append(p)

# Renumber ids sequentially
for i, p in enumerate(kept, start=1):
    p["id"] = i

print(f"Kept: {len(kept)}")
print(f"Removed: {len(removed)}")

with open(JSON, "w", encoding="utf-8") as f:
    json.dump(kept, f, ensure_ascii=False, indent=2)

print("Written products.json")
