const express = require('express');
const cors = require('cors');
//const dataRoutes = require('./routes/dataRoutes');
const { exportData } = require('./controllers/dataController');

const app = express();
app.use(cors());
//app.use('/api', dataRoutes);
app.get('/api/export', exportData);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
