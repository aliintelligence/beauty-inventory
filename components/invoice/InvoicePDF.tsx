'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Svg, Circle, Path } from '@react-pdf/renderer'

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottom: '2 solid #EC4899',
    paddingBottom: 20,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 50,
    height: 50,
    backgroundColor: '#EC4899',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 12,
    color: '#9333EA',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  invoiceTitle: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  invoiceTitleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 3,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  customerSection: {
    backgroundColor: '#FDF2F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderLeft: '4 solid #EC4899',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 10,
  },
  customerInfo: {
    lineHeight: 1.6,
  },
  customerText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 3,
  },
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EC4899',
    padding: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottom: '1 solid #E5E7EB',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 12,
    borderBottom: '1 solid #E5E7EB',
    backgroundColor: '#FEFCFF',
  },
  col1: { width: '45%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    padding: 15,
    backgroundColor: '#EC4899',
    borderRadius: 8,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #E5E7EB',
    alignItems: 'center',
  },
  thankYou: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 15,
  },
  decorativeElements: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  heartIcon: {
    fontSize: 24,
    color: '#EC4899',
  },
})

interface InvoiceData {
  id: string
  customer_name?: string | null
  customer_phone?: string | null
  customer_address?: string | null
  total_amount: number
  created_at: string
  order_items: Array<{
    quantity: number
    unit_price: number
    total_price: number
    products: {
      name: string
    }
  }>
}

interface InvoicePDFProps {
  orderData: InvoiceData
}

// Generate invoice number from order ID
const generateInvoiceNumber = (orderId: string): string => {
  const shortId = orderId.slice(-8).toUpperCase()
  return `GA-${shortId}`
}

// Format currency for Trinidad & Tobago
const formatCurrency = (amount: number): string => {
  return `TT$${amount.toFixed(2)}`
}

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-TT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// PDF Document Component
const InvoiceDocument: React.FC<{ orderData: InvoiceData }> = ({ orderData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <View style={styles.logo}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>Ga</Text>
            </View>
            <View>
              <Text style={styles.companyName}>Gurl Aesthetic</Text>
              <Text style={styles.companyTagline}>✨ Nail Accessories & Girly Beauty Products ✨</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.invoiceTitle}>
          <Text style={styles.invoiceTitleText}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{generateInvoiceNumber(orderData.id)}</Text>
          <Text style={styles.invoiceDate}>{formatDate(orderData.created_at)}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.customerSection}>
        <Text style={styles.sectionTitle}>💕 Bill To</Text>
        <View style={styles.customerInfo}>
          {orderData.customer_name ? (
            <Text style={styles.customerText}>👤 {orderData.customer_name}</Text>
          ) : (
            <Text style={styles.customerText}>👤 Valued Customer</Text>
          )}
          {orderData.customer_phone && (
            <Text style={styles.customerText}>📞 {orderData.customer_phone}</Text>
          )}
          {orderData.customer_address && (
            <Text style={styles.customerText}>📍 {orderData.customer_address}</Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1]}>💄 Product</Text>
          <Text style={[styles.col2]}>Qty</Text>
          <Text style={[styles.col3]}>Unit Price</Text>
          <Text style={[styles.col4]}>Total</Text>
        </View>
        
        {orderData.order_items.map((item, index) => (
          <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.col1}>{item.products.name}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{formatCurrency(item.unit_price)}</Text>
            <Text style={styles.col4}>{formatCurrency(item.total_price)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>💰 Total Amount</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(orderData.total_amount)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.thankYou}>💖 Thank You for Your Business! 💖</Text>
        <Text style={styles.footerText}>
          Thank you for choosing Gurl Aesthetic! We appreciate your support of our{'\n'}
          nail art and beauty business. For any questions about your order,{'\n'}
          please don't hesitate to contact us.
        </Text>
        <Text style={styles.footerText}>
          💅 Stay gorgeous! 💅
        </Text>
      </View>
    </Page>
  </Document>
)

// Main component for generating PDF
const InvoicePDF: React.FC<InvoicePDFProps> = ({ orderData }) => {
  const fileName = `invoice-${generateInvoiceNumber(orderData.id)}.pdf`

  return (
    <PDFDownloadLink
      document={<InvoiceDocument orderData={orderData} />}
      fileName={fileName}
      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating PDF...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            💄 Download Cute Invoice
          </>
        )
      }
    </PDFDownloadLink>
  )
}

export default InvoicePDF