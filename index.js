const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")
const dotenv = require("dotenv");
const TypeModel = require("./models/Type")

dotenv.config();
const app = express();
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connection Successful"))
    .catch((err) => console.log(err))


app.post('/create-type', async (req, res) => {
    try {
        const { typeName, steps } = req.body;

        // Check if typeName already exists
        const existingType = await TypeModel.findOne({ typeName });
        if (existingType) {
            return res.status(400).json({ error: 'Type with this name already exists' });
        }
        const updatedSteps = steps.map(step => ({ ...step, condition: false }));


        // Create a new type
        const newType = new TypeModel({ typeName, steps: updatedSteps });
        await newType.save();

        res.status(201).json({ message: "Type Created Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


app.get('/types/:id', async (req, res) => {
    try {
        const type = await TypeModel.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ error: 'Type not found' });
        }
        res.json(type);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/types/:id', async (req, res) => {
    try {
        const { typeName, steps } = req.body;

        // Check if typeName already exists
        const existingType = await TypeModel.findOne({ typeName });
        if (existingType && existingType._id.toString() !== req.params.id) {
            return res.status(400).json({ error: 'Type with this name already exists' });
        }

        const updatedSteps = steps.map(step => ({ ...step, condition: false }));

        const updatedType = await TypeModel.findByIdAndUpdate(req.params.id, { typeName, steps: updatedSteps }, { new: true });
        if (!updatedType) {
            return res.status(404).json({ error: 'Type not found' });
        }
        res.json({ message: "Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET route to fetch only _id and typeName of all types
app.get('/types', async (req, res) => {
    try {
        const types = await TypeModel.find({}, '_id typeName');
        res.json(types);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



app.listen(5000, () => {
    console.log(`Server is running`);
});


