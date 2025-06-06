// src/pages/Reporte.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reporte.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from "@react-pdf/renderer";

// Colores para gráficas
const colores = ["#ae8957", "#ffbb28", "#8884d8", "#82ca9d", "#ff6666"];

// Estilos para el PDF
Font.register({
  family: "Helvetica-Bold",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/helveticaneue/v11/KF_4PxlK1A7kCqQnzjSAaQ.ttf",
    },
  ],
});

const stylesPDF = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    backgroundColor: "#fff",
    color: "#333",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#ae8957",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #ccc",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
    textDecoration: "underline",
  },
  item: {
    marginBottom: 3,
  },
});

const ReportePDF = ({ facturas, gananciasPorMes }) => (
  <Document>
    <Page style={stylesPDF.page}>
      <Text style={stylesPDF.title}>Reporte de Ventas - Pixel Store</Text>

      <View style={stylesPDF.section}>
        <Text style={stylesPDF.subtitle}>Ganancias por Mes</Text>
        {gananciasPorMes.map((g, i) => (
          <Text key={i} style={stylesPDF.item}>
            📅 {g.mes}: ${g.ganancia.toFixed(2)}
          </Text>
        ))}
      </View>

      <View style={stylesPDF.section}>
        <Text style={stylesPDF.subtitle}>Facturas Detalladas</Text>
        {facturas.map(f => (
          <View key={f.id} style={stylesPDF.item}>
            <Text>
              🧾 ID: {f.id} | Usuario: {f.usuario_id} | {new Date(f.fecha).toLocaleString()} | {f.metodo_pago} | Total: ${f.total} {f.divisa}
            </Text>
            {f.detalles.map((d, i) => (
              <Text key={i}>
                🎮 {d.juego.titulo} – Cantidad: {d.cantidad} – Subtotal: ${d.subtotal}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const Reporte = () => {
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://pixel-store-nii6.onrender.com/facturas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFacturas(res.data);
    };
    cargar();
  }, []);

  // Datos por fecha (gráfico barras)
  const porFecha = facturas.reduce((acc, f) => {
    const fecha = f.fecha.split("T")[0];
    const existe = acc.find(e => e.fecha === fecha);
    if (existe) existe.total += f.total;
    else acc.push({ fecha, total: f.total });
    return acc;
  }, []);

  // Juegos vendidos (torta y top5)
  const juegosVendidos = {};
  facturas.forEach(f => {
    f.detalles.forEach(d => {
      const titulo = d.juego.titulo;
      juegosVendidos[titulo] = (juegosVendidos[titulo] || 0) + d.cantidad;
    });
  });
  const dataTorta = Object.entries(juegosVendidos).map(([name, value]) => ({ name, value }));
  const top5 = [...dataTorta].sort((a, b) => b.value - a.value).slice(0, 5);

  // Ganancias por mes (gráfico línea)
  const gananciasPorMes = facturas.reduce((acc, f) => {
    const mes = new Date(f.fecha).toLocaleString("default", { month: "long" });
    const existe = acc.find(e => e.mes === mes);
    if (existe) existe.ganancia += f.total;
    else acc.push({ mes, ganancia: f.total });
    return acc;
  }, []);

  return (
    <div className="reporte-container">
      <h1 className="reporte-header">📊 Reporte de Ventas</h1>

      {/* Tabla */}
      <section className="reporte-section">
        <h2 className="section-title">📋 Tabla de Facturas</h2>
        <div className="table-wrapper">
          <table className="reporte-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.usuario_id}</td>
                  <td>{new Date(f.fecha).toLocaleString()}</td>
                  <td>{f.metodo_pago}</td>
                  <td>${f.total} {f.divisa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gráficas */}
      <div className="reporte-grid">
        <section className="reporte-section">
          <h2 className="section-title">💰 Total por Día</h2>
          <div className="grafica-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={porFecha}>
                <XAxis dataKey="fecha" stroke="#ae8957" />
                <YAxis stroke="#ae8957" />
                <Tooltip />
                <Bar dataKey="total" fill="#ae8957" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="reporte-section">
          <h2 className="section-title">🥧 Juegos Más Vendidos</h2>
          <div className="grafica-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataTorta}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  {dataTorta.map((_, i) => (
                    <Cell key={i} fill={colores[i % colores.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="reporte-section">
          <h2 className="section-title">📈 Ganancias por Mes</h2>
          <div className="grafica-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gananciasPorMes}>
                <XAxis dataKey="mes" stroke="#ae8957" />
                <YAxis stroke="#ae8957" />
                <Tooltip />
                <Line type="monotone" dataKey="ganancia" stroke="#ff6666" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="reporte-section reporte-top5-section">
          <h2 className="section-title">🏆 Top 5 Juegos Más Vendidos</h2>
          <ul className="reporte-top5">
            {top5.map((j, i) => (
              <li key={i}>
                #{i + 1} <strong>{j.name}</strong> — {j.value} copias
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Botón PDF */}
      <div className="pdf-wrapper">
        <PDFDownloadLink
          document={<ReportePDF facturas={facturas} gananciasPorMes={gananciasPorMes} />}
          fileName="reporte_ventas.pdf"
          className="reporte-pdf-btn"
        >
          📥 Descargar PDF
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default Reporte;
