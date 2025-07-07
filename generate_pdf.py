import markdown2
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
import os

# Chemins
md_path = "rapport_conception_stageai.md"
pdf_path = "rapport_conception_stageai.pdf"

def md_to_text(md_file):
    with open(md_file, encoding="utf-8") as f:
        html = markdown2.markdown(f.read())
    # Extraction simple du texte (sans balises)
    import re
    text = re.sub('<[^<]+?>', '', html)
    return text

def write_pdf(text, pdf_file):
    c = canvas.Canvas(pdf_file, pagesize=A4)
    width, height = A4
    x, y = 2*cm, height - 2*cm
    for line in text.split('\n'):
        if y < 2*cm:
            c.showPage()
            y = height - 2*cm
        c.drawString(x, y, line)
        y -= 14
    c.save()

def main():
    text = md_to_text(md_path)
    write_pdf(text, pdf_path)
    print(f"PDF généré : {pdf_path}")

if __name__ == "__main__":
    main()
