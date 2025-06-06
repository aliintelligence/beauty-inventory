'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#374151',
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingBottom: 25,
    borderBottom: '3 solid #EC4899',
  },
  
  // Logo Section
  logoSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoCircle: {
    width: 60,
    height: 60,
    backgroundColor: '#EC4899',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  companyTagline: {
    fontSize: 14,
    color: '#9333EA',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  companyContact: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  
  // Invoice Title Section
  invoiceSection: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  invoiceStatus: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Customer Section
  customerSection: {
    backgroundColor: '#FDF2F8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 35,
    borderLeft: '6 solid #EC4899',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
  },
  customerInfo: {
    lineHeight: 1.7,
  },
  customerText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  
  // Items Table
  table: {
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EC4899',
    padding: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottom: '1 solid #E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 15,
    borderBottom: '1 solid #E5E7EB',
    backgroundColor: '#FEFCFF',
  },
  
  // Table Columns with better alignment
  col1: { 
    width: '45%',
    paddingRight: 10,
  },
  col2: { 
    width: '15%', 
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  col3: { 
    width: '20%', 
    textAlign: 'right',
    paddingHorizontal: 5,
  },
  col4: { 
    width: '20%', 
    textAlign: 'right',
    paddingLeft: 10,
    fontWeight: 'bold',
  },
  
  // Summary Section
  summarySection: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryContainer: {
    width: 280,
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    border: '1 solid #E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 80,
  },
  
  // Grand Total
  grandTotalContainer: {
    backgroundColor: '#EC4899',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  
  // Footer
  footer: {
    marginTop: 50,
    paddingTop: 25,
    borderTop: '2 solid #E5E7EB',
    alignItems: 'center',
  },
  thankYou: {
    fontSize: 18,
    color: '#EC4899',
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Helvetica-Bold',
  },
  footerText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  
  // Decorative Elements
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 100,
    color: '#F9FAFB',
    opacity: 0.1,
    zIndex: -1,
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

// Calculate subtotal, tax, and other fees
const calculateSummary = (orderData: InvoiceData) => {
  const subtotal = orderData.total_amount
  const tax = 0 // No tax for now
  const shipping = 0 // No shipping for now
  const total = subtotal + tax + shipping
  
  return { subtotal, tax, shipping, total }
}

// PDF Document Component
const InvoiceDocument: React.FC<{ orderData: InvoiceData }> = ({ orderData }) => {
  const summary = calculateSummary(orderData)
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>Gurl Aesthetic</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>Ga</Text>
              </View>
              <View>
                <Text style={styles.companyName}>Gurl Aesthetic</Text>
              </View>
            </View>
            <Text style={styles.companyTagline}>✨ Nail Accessories & Girly Beauty Products ✨</Text>
            <View style={styles.companyContact}>
              <Text>Trinidad & Tobago</Text>
              <Text>Email: info@gurlaesthetic.com</Text>
              <Text>Phone: +1 (868) 123-4567</Text>
            </View>
          </View>
          
          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{generateInvoiceNumber(orderData.id)}</Text>
            <Text style={styles.invoiceDate}>Date: {formatDate(orderData.created_at)}</Text>
            <View style={styles.invoiceStatus}>
              <Text>PAID</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>💕 Bill To</Text>
          <View style={styles.customerInfo}>
            {orderData.customer_name ? (
              <Text style={styles.customerText}>👤 Name: {orderData.customer_name}</Text>
            ) : (
              <Text style={styles.customerText}>👤 Name: Valued Customer</Text>
            )}
            {orderData.customer_phone && (
              <Text style={styles.customerText}>📞 Phone: {orderData.customer_phone}</Text>
            )}
            {orderData.customer_address && (
              <Text style={styles.customerText}>📍 Address: {orderData.customer_address}</Text>
            )}
            {!orderData.customer_phone && !orderData.customer_address && (
              <Text style={styles.customerText}>Thank you for your business!</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>💄 Product Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Unit Price</Text>
            <Text style={styles.col4}>Total</Text>
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

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.subtotal)}</Text>
            </View>
            
            {summary.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (0%):</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary.tax)}</Text>
              </View>
            )}
            
            {summary.shipping > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary.shipping)}</Text>
              </View>
            )}
            
            <View style={styles.grandTotalContainer}>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>💰 TOTAL</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(summary.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>💖 Thank You for Your Business! 💖</Text>
          <Text style={styles.footerText}>
            Thank you for choosing Gurl Aesthetic! We appreciate your support of our
          </Text>
          <Text style={styles.footerText}>
            nail art and beauty business. For any questions about your order,
          </Text>
          <Text style={styles.footerText}>
            please don&apos;t hesitate to contact us at info@gurlaesthetic.com
          </Text>
          <Text style={styles.footerText}>
            💅 Stay gorgeous! 💅
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Main component for generating PDF
const InvoicePDF: React.FC<InvoicePDFProps> = ({ orderData }) => {
  const fileName = `invoice-${generateInvoiceNumber(orderData.id)}.pdf`

  return (
    <PDFDownloadLink
      document={<InvoiceDocument orderData={orderData} />}
      fileName={fileName}
      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
    >
      {({ loading }) =>
        loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>💄 Download Cute Invoice</span>
          </>
        )
      }
    </PDFDownloadLink>
  )
}

export default InvoicePDF