const oracledb = require('oracledb');
const { dbConfig, activeDB } = require('../models/db');
const ExcelJS = require('exceljs');

oracledb.initOracleClient({ libDir: 'D:\\app\\caden\\product\\11.2.0\\client_1' }); // Cambia esta ruta según la ubicación de tu instant client

const exportData = async (req, res) => {
  if (activeDB === 'postgres') {
    try {
      const client = await dbConfig.connect();
      const result = await client.query('SELECT * FROM task');
      const data = result.rows;
      client.release();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Cambios Cond Opo');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Descripción', key: 'description', width: 30 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Fecha de Creación', key: 'created_at', width: 20 }
      ];

      // Aplicar formato a los encabezados en la fila 3
      const headerRow = worksheet.getRow(3);
      headerRow.values = ['ID', 'Nombre', 'Descripción', 'Estado', 'Fecha de Creación'];
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, bold: true };
        cell.alignment = { vertical: 'top', horizontal: 'center', textRotation: -90 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        let fillColor = 'FFFFFF'; // Default color
        if (colNumber >= 1 && colNumber <= 36) {
          fillColor = 'CCFFCC';
        } else if (colNumber >= 37 && colNumber <= 62) {
          fillColor = 'FFFFCC';
        } else if (colNumber >= 63 && colNumber <= 74) {
          fillColor = 'FFCC00';
        } else if (colNumber >= 75 && colNumber <= 100) {
          fillColor = 'FFCC99';
        } else if (colNumber >= 101 && colNumber <= 109) {
          fillColor = '99CCFF';
        } else if (colNumber >= 110 && colNumber <= 112) {
          fillColor = 'FFFFCC';
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
      });

      data.forEach((row) => {
        worksheet.addRow(row);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Exportado.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error('Error exporting data:', err);
      res.status(500).send('Error exporting data');
    }
  } else if (activeDB === 'oracle') {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result1 = await connection.execute('SELECT * FROM v_idoe_ecs_borrar');
        const data1 = result1.rows;

        const result2 = await connection.execute('SELECT * from vm_idoe_anexo_v7_ecs_borrar');
        const data2 = result2.rows;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('D:/Plantilla.xlsx'); // Ruta a tu plantilla de Excel

        // Listar nombres de hojas de trabajo para verificar
        const worksheetNames = workbook.worksheets.map(sheet => sheet.name);
        console.log('Hojas de trabajo encontradas en el libro:', worksheetNames);

        const worksheet1 = workbook.getWorksheet('CIOPEX');
        const worksheet2 = workbook.getWorksheet('Anexos');

        if (!worksheet1 || !worksheet2) {
            throw new Error('Una o ambas hojas de trabajo no se encontraron en la plantilla.');
        }

          // Función auxiliar para convertir una celda a número
        function convertColumnToNumber(worksheet, columnNumber) {
          worksheet.eachRow((row, rowNumber) => {
              if (rowNumber >= 4) { // Ignorar encabezados en las primeras 3 filas
                  const cell = row.getCell(columnNumber);
                  if (!isNaN(cell.value)) {
                      cell.value = Number(cell.value);
                  }
              }
          });
      }

          function convertColumnToNumberIfPossible(worksheet, columnNumber) {
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber >= 4) { // Ignorar encabezados en las primeras 3 filas
                    const cell = row.getCell(columnNumber);
                    if (!isNaN(cell.value) && cell.value !== null && cell.value !== undefined) {
                        cell.value = Number(cell.value);
                    }
                }
            });
        }

        // Insertar los datos en la fila 4 de la hoja "CIOPEX"
        data1.forEach((row, index) => {
            const rowNumber = index + 4;
            const newRow = worksheet1.addRow(row);
            newRow.commit();
        });

        // Insertar los datos en la fila 4 de la hoja "Anexos"
        data2.forEach((row, index) => {
            const rowNumber = index + 4;
            const newRow = worksheet2.addRow(row);
            newRow.commit();
        });

        // Convertir la columna 3 a número en ambas hojas de trabajo
         // Convertir la columna 3 a número en ambas hojas de trabajo
         convertColumnToNumberIfPossible(worksheet1, 3);
         convertColumnToNumberIfPossible(worksheet2, 3);
 
         // Convertir las columnas Y (25) y Z (26) a número si es posible
         convertColumnToNumberIfPossible(worksheet1, 25);
         convertColumnToNumberIfPossible(worksheet1, 26);
         convertColumnToNumberIfPossible(worksheet2, 25);
         convertColumnToNumberIfPossible(worksheet2, 26);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Exportado.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error exporting data:', err);
        res.status(500).send('Error exporting data');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}  else {
    res.status(500).send('No active database configuration found');
  }
};

module.exports = {
  exportData,
};
