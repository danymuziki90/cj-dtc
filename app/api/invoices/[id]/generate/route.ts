import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const invoiceId = parseInt(resolvedParams.id)

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        enrollment: {
          include: {
            formation: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    // Pour l'instant, on retourne les données de la facture
    // La génération PDF sera implémentée avec une bibliothèque comme pdfkit ou @react-pdf/renderer
    // Pour l'instant, on génère un HTML qui peut être converti en PDF côté client

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Facture ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
            .company { color: #0066cc; font-size: 24px; font-weight: bold; }
            .invoice-info { float: right; text-align: right; }
            .section { margin: 20px 0; }
            .billing-info { display: flex; justify-content: space-between; margin: 30px 0; }
            .billing-box { width: 48%; }
            .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #0066cc; color: white; }
            .total-row { font-weight: bold; background-color: #f5f5f5; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">CJ DEVELOPMENT TRAINING CENTER</div>
            <div class="invoice-info">
              <h2>FACTURE</h2>
              <p><strong>N°:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><strong>Statut:</strong> ${invoice.status}</p>
            </div>
          </div>

          <div class="billing-info">
            <div class="billing-box">
              <h3>Facturé à:</h3>
              <p><strong>${invoice.enrollment.firstName} ${invoice.enrollment.lastName}</strong></p>
              <p>${invoice.enrollment.email}</p>
              ${invoice.enrollment.phone ? `<p>${invoice.enrollment.phone}</p>` : ''}
              ${invoice.enrollment.address ? `<p>${invoice.enrollment.address}</p>` : ''}
            </div>
            <div class="billing-box">
              <h3>Formation:</h3>
              <p><strong>${invoice.enrollment.formation.title}</strong></p>
              ${invoice.dueDate ? `<p><strong>Échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>` : ''}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Montant HT</th>
                <th>TVA</th>
                <th>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Formation: ${invoice.enrollment.formation.title}</td>
                <td>${invoice.amount.toLocaleString('fr-FR')} USD</td>
                <td>${invoice.taxAmount.toLocaleString('fr-FR')} USD</td>
                <td>${invoice.totalAmount.toLocaleString('fr-FR')} USD</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td><strong>${invoice.totalAmount.toLocaleString('fr-FR')} USD</strong></td>
              </tr>
            </tbody>
          </table>

          ${invoice.notes ? `<div class="section"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}

          <div class="footer">
            <p><strong>CJ DEVELOPMENT TRAINING CENTER</strong></p>
            <p>Centre Panafricain de Formation Professionnelle, Leadership et Insertion</p>
            <p>Email: contact@cjdevelopmenttc.com | Site: www.cjdevelopmenttc.com</p>
          </div>
        </body>
      </html>
    `

    // Retourner le HTML pour l'instant
    // Plus tard, on pourra utiliser une bibliothèque pour générer directement un PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de la génération de la facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la facture' },
      { status: 500 }
    )
  }
}
