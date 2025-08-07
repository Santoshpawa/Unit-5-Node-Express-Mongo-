const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');

const app = express();
app.use(express.json());

// Replace with your MongoDB URI
mongoose.connect('mongodb://127.0.0.1:27017/user-address-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use('/', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
