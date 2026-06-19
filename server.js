const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'ryotahub-secret-key',
        resave: false,
            saveUninitialized: true
            }));

            app.use(express.static(path.join(__dirname, 'public')));

            let db = {
                user: {
                        username: 'ryota21',
                                password: 'ryota 421',
                                        saldo: 51509800
                                            },
                                                keys: [],
                                                    prices: {
                                                            'ZH-1D': 2000,
                                                                    'ZH-3D': 5000,
                                                                            'ZH-7D': 10000,
                                                                                    'ZH-30D': 20000
                                                                                        }
                                                                                        };

                                                                                        function checkAuth(req, res, next) {
                                                                                            if (req.session.loggedIn) {
                                                                                                    next();
                                                                                                        } else {
                                                                                                                res.redirect('/login.html');
                                                                                                                    }
                                                                                                                    }

                                                                                                                    app.post('/api/login', (req, res) => {
                                                                                                                        const { username, password } = req.body;
                                                                                                                            if (username === db.user.username && password === db.user.password) {
                                                                                                                                    req.session.loggedIn = true;
                                                                                                                                            res.json({ success: true });
                                                                                                                                                } else {
                                                                                                                                                        res.json({ success: false, message: 'Username atau Password salah!' });
                                                                                                                                                            }
                                                                                                                                                            });

                                                                                                                                                            app.get('/api/logout', (req, res) => {
                                                                                                                                                                req.session.destroy();
                                                                                                                                                                    res.redirect('/login.html');
                                                                                                                                                                    });

                                                                                                                                                                    app.get('/api/overview', checkAuth, (req, res) => {
                                                                                                                                                                        res.json({
                                                                                                                                                                                saldo: db.user.saldo,
                                                                                                                                                                                        totalKeys: db.keys.length,
                                                                                                                                                                                                prices: db.prices,
                                                                                                                                                                                                        keys: db.keys
                                                                                                                                                                                                            });
                                                                                                                                                                                                            });

                                                                                                                                                                                                            app.post('/api/topup', checkAuth, (req, res) => {
                                                                                                                                                                                                                const { jumlah } = req.body;
                                                                                                                                                                                                                    const amount = parseInt(jumlah);
                                                                                                                                                                                                                        if (!isNaN(amount) && amount > 0) {
                                                                                                                                                                                                                                db.user.saldo += amount;
                                                                                                                                                                                                                                        res.json({ success: true, newSaldo: db.user.saldo });
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                    res.json({ success: false, message: 'Jumlah tidak valid' });
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                        app.post('/api/generate-key', checkAuth, (req, res) => {
                                                                                                                                                                                                                                                            const { durasi, note } = req.body;
                                                                                                                                                                                                                                                                const harga = db.prices[durasi];

                                                                                                                                                                                                                                                                    if (!harga) return res.json({ success: false, message: 'Durasi tidak valid' });
                                                                                                                                                                                                                                                                        if (db.user.saldo < harga) return res.json({ success: false, message: 'Saldo tidak cukup!' });

                                                                                                                                                                                                                                                                            db.user.saldo -= harga;
                                                                                                                                                                                                                                                                                const generatedKey = durasi + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                        const newKey = {
                                                                                                                                                                                                                                                                                                id: db.keys.length + 1,
                                                                                                                                                                                                                                                                                                        key: generatedKey,
                                                                                                                                                                                                                                                                                                                status: 'Aktif',
                                                                                                                                                                                                                                                                                                                        durasi: durasi,
                                                                                                                                                                                                                                                                                                                                note: note || '-',
                                                                                                                                                                                                                                                                                                                                        date: new Date().toLocaleDateString('id-ID')
                                                                                                                                                                                                                                                                                                                                            };

                                                                                                                                                                                                                                                                                                                                                db.keys.push(newKey);
                                                                                                                                                                                                                                                                                                                                                    res.json({ success: true, key: newKey, newSaldo: db.user.saldo });
                                                                                                                                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                                                                                                                                    app.get('/api/check-key', (req, res) => {
                                                                                                                                                                                                                                                                                                                                                        const userKey = req.query.key;
                                                                                                                                                                                                                                                                                                                                                            if (!userKey) return res.json({ status: "error", message: "Key kosong!" });

                                                                                                                                                                                                                                                                                                                                                                const foundKey = db.keys.find(k => k.key === userKey);
                                                                                                                                                                                                                                                                                                                                                                    if (foundKey) {
                                                                                                                                                                                                                                                                                                                                                                            if (foundKey.status === 'Aktif') {
                                                                                                                                                                                                                                                                                                                                                                                        res.json({ status: "success", message: "Key Valid!", durasi: foundKey.durasi, note: foundKey.note });
                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                            res.json({ status: "expired", message: "Key expired!" });
                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                res.json({ status: "invalid", message: "Key tidak ditemukan!" });
                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                                                                                                                                                                                                                    app.get('/', checkAuth, (req, res) => {
                                                                                                                                                                                                                                                                                                                                                                                                                                        res.sendFile(path.join(__dirname, 'public', 'index.html'));
                                                                                                                                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                                                                                                                                        app.listen(PORT, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                            console.log(`Server running on port ${PORT}`);
                                                                                                                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                                                                                                                            