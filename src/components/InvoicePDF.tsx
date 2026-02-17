import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #ccc',
    paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 10, marginTop: 5, color: '#666' },
  clientInfo: { marginTop: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 5 },
  label: { fontWeight: 'bold', fontSize: 9, width: 80 },
  value: { fontSize: 11, flex: 1 },
  clientSection: { marginTop: 10 },
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingVertical: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    fontSize: 10,
  },
  col1: { flex: 2 }, // Description
  col2: { flex: 1, textAlign: 'right' }, // Unit
  col3: { flex: 1, textAlign: 'right' }, // Glass
  col4: { flex: 1, textAlign: 'right' }, // Price
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '2pt solid #000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
});

export type InvoiceItem = {
  orderId: string;
  unitNumber: string;
  truckModel: string;
  glassPosition: string;
  price: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  items: InvoiceItem[];
  total: number;
};

export const InvoicePDF = ({ data }: { data: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>FACTURA</Text>
        <Text style={styles.subtitle}>Glass Installation Services</Text>
      </View>

      {/* Invoice Info */}
      <View style={styles.clientInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Folio:</Text>
          <Text style={styles.value}>{data.invoiceNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{data.invoiceDate}</Text>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{data.clientName}</Text>
          {data.clientAddress && (
            <Text style={styles.value}>{data.clientAddress}</Text>
          )}
          {data.clientPhone && (
            <Text style={styles.value}>{data.clientPhone}</Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Descripción</Text>
          <Text style={styles.col2}>Unidad</Text>
          <Text style={styles.col3}>Vidrio</Text>
          <Text style={styles.col4}>Precio</Text>
        </View>

        {data.items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.col1}>
              {item.orderId}
              {' '}
              -
              {item.truckModel}
            </Text>
            <Text style={styles.col2}>{item.unitNumber}</Text>
            <Text style={styles.col3}>{item.glassPosition}</Text>
            <Text style={styles.col4}>
              $
              {item.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text>
            TOTAL: $
            {data.total.toFixed(2)}
            {' '}
            MXN
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Gracias por su preferencia</Text>
        <Text>
          Generado el
          {' '}
          {new Date().toLocaleString('es-MX')}
        </Text>
      </View>
    </Page>
  </Document>
);
