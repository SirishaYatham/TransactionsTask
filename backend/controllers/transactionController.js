const axios = require('axios');
const Transaction = require('../models/Transaction');

exports.initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        await Transaction.deleteMany({});
        await Transaction.insertMany(transactions);

        res.json({ message: "Database initialized with seed data" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const month = req.query.month ? new Date(`${req.query.month} 1`) : new Date();

        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const transactions = await Transaction.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { price: !isNaN(searchQuery) ? Number(searchQuery) : { $exists: false } },
            ],
            dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }
        })
        .skip((page - 1) * perPage)
        .limit(perPage);

        const totalTransactions = await Transaction.countDocuments({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { price: !isNaN(searchQuery) ? Number(searchQuery) : { $exists: false } },
            ],
            dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }
        });

        res.json({ transactions, total: totalTransactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    const start = new Date(`${month} 1`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const totalSales = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: start, $lt: end }, sold: true } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const soldItems = await Transaction.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: true });
    const unsoldItems = await Transaction.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: false });

    res.json({ totalSales: totalSales[0]?.total || 0, soldItems, unsoldItems });
};

exports.getBarChart = async (req, res) => {
    const { month } = req.query;
    const start = new Date(`${month} 1`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const ranges = [100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity];

    const barChart = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: start, $lt: end } } },
        { $bucket: { groupBy: "$price", boundaries: ranges, default: "901-above" } },
        { $group: { _id: "$_id", count: { $sum: 1 } } }
    ]);

    res.json(barChart);
};

exports.getPieChart = async (req, res) => {
    const { month } = req.query;
    const start = new Date(`${month} 1`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const pieChart = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: start, $lt: end } } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json(pieChart);
};

exports.getCombinedData = async (req, res) => {
    try {
        const [statistics, barChart, pieChart] = await Promise.all([
            this.getStatistics(req, res),
            this.getBarChart(req, res),
            this.getPieChart(req, res)
        ]);

        res.json({ statistics, barChart, pieChart });
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).json({ message: error.message });
    }
};
