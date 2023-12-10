const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'хост',
  user: 'пользователь',
  password: 'пароль',
  database: 'бд'
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ' + err.stack);
    return;
  }
  console.log('Подключено к базе данных, id ' + db.threadId);
});

// API endpoint для создания и редактирования карточки заведения
app.post('/api/restaurant', (req, res) => {
  const restaurantData = req.body;

  //  SQL-запроса для вставки или обновления данных в таблице Restaurant
  const sql = `
  INSERT INTO restaurants (id_rest, restaurant_name, restaurant_address, restaurant_phone, EMAIL_restaurant, restaurant_requisites, password_hash, salt, check) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE restaurant_name = VALUES(restaurant_name), restaurant_address = VALUES(restaurant_address), restaurant_phone = VALUES(restaurant_phone), 
  EMAIL_restaurant = VALUES(EMAIL_restaurant), restaurant_requisites = VALUES(restaurant_requisites), 
  password_hash = VALUES(password_hash), salt = VALUES(salt), check = VALUES(check);
`;

db.query(sql, [
  restaurantData.id_rest,
  restaurantData.restaurant_name,
  restaurantData.restaurant_address,
  restaurantData.restaurant_phone,
  restaurantData.EMAIL_restaurant,
  restaurantData.restaurant_requisites,
  restaurantData.password_hash,
  restaurantData.salt,
  restaurantData.check,
], (err, result) => {
    if (err) {
      console.error('Ошибка при создании/редактировании карточки заведения: ' + err.message);
      res.status(500).json({ error: 'Ошибка при создании/редактировании карточки заведения' });
      return;
    }

    console.log('Карточка заведения успешно создана/отредактирована, id: ' + result.insertId);
    res.status(201).json({ message: 'Карточка заведения успешно создана/отредактирована', restaurantId: result.insertId });
  });
});

// Добавление, удаление и редактирование позиций в каталоге
app.post('/api/catalogue/item', (req, res) => {
  const catalogItemData = req.body;

  const sql = `
    INSERT INTO catalogue (id_catalogue, catalog_name, price, restaurants_id_rest)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE Назвcatalog_nameание = VALUES(catalog_name), price = VALUES(price);
  `;

  db.query(sql, [
    catalogItemData.id_catalogue,
    catalogItemData.catalog_name,
    catalogItemData.price,
    catalogItemData.restaurants_id_rest,
  ], (err, result) => {
    if (err) {
      console.error('Ошибка при добавлении/редактировании позиции в каталоге: ' + err.message);
      res.status(500).json({ error: 'Ошибка при добавлении/редактировании позиции в каталоге' });
      return;
    }

    console.log('Позиция в каталоге успешно добавлена/отредактирована, id: ' + result.insertId);
    res.status(201).json({ message: 'Позиция в каталоге успешно добавлена/отредактирована', catalogItemId: result.insertId });
  });
});

app.delete('/api/catalogue/item/:itemId', (req, res) => {
  const itemId = req.params.itemId;

  const sql = 'DELETE FROM catalogue WHERE id_catalogue = ?';

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      console.error('Ошибка при удалении позиции из каталога: ' + err.message);
      res.status(500).json({ error: 'Ошибка при удалении позиции из каталога' });
      return;
    }

    console.log('Позиция из каталога успешно удалена, id: ' + itemId);
    res.status(200).json({ message: 'Позиция из каталога успешно удалена' });
  });
});

// Добавление меню к заказу(возможно не правильно)
app.post('/api/order/menu', (req, res) => {
  const orderMenuData = req.body;

  const sql = `
    INSERT INTO order_catalog (catalog_id_catalogue, order_id_order, quantity, price)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), price = VALUES(price);
  `;

  db.query(sql, [
    orderMenuData.catalogId,
    orderMenuData.orderId,
    orderMenuData.quantity,
    orderMenuData.price,
  ], (err, result) => {
    if (err) {
      console.error('Ошибка при добавлении меню к заказу: ' + err.message);
      res.status(500).json({ error: 'Ошибка при добавлении меню к заказу' });
      return;
    }

    console.log('Меню успешно добавлено к заказу, id: ' + result.insertId);
    res.status(201).json({ message: 'Меню успешно добавлено к заказу', orderMenuId: result.insertId });
  });
});

// Присваивание статуса заказу
app.put('/api/order/status/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.newStatus;

  const sql = 'UPDATE Order SET status = ? WHERE id = ?';

  db.query(sql, [newStatus, orderId], (err, result) => {
    if (err) {
      console.error('Ошибка при изменении статуса заказа: ' + err.message);
      res.status(500).json({ error: 'Ошибка при изменении статуса заказа' });
      return;
    }

    console.log('Статус заказа успешно изменен, id: ' + orderId);
    res.status(200).json({ message: 'Статус заказа успешно изменен' });
  });
});

// Создание заказа и изменение суммы счета
app.post('/api/order', (req, res) => {
  const orderData = req.body;

  // Пример SQL-запроса для вставки данных в таблицу Order
  const sqlOrder = `
    INSERT INTO order (id_order, totalsum, order_address, catalog_name, delivery_time, ready_time, restaurants_id_rest, status_id_status, courier_id_courier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  db.query(sqlOrder, [
    orderData.id_order,
    orderData.totalsum,
    orderData.order_address,
    orderData.catalog_name,
    orderData.delivery_time,
    orderData.ready_time,
    orderData.restaurants_id_rest,
    orderData.status_id_status,
    orderData.courier_id_courier,
  ], (err, result) => {
    if (err) {
      console.error('Ошибка при создании заказа: ' + err.message);
      res.status(500).json({ error: 'Ошибка при создании заказа' });
      return;
    }

    const orderId = result.insertId;

    // Пример SQL-запроса для изменения суммы счета в созданном заказе
    const sqlUpdateTotalAmount = `
      UPDATE Order
      SET totalsum = ?
      WHERE id_order = ?;
    `;

    db.query(sqlUpdateTotalAmount, [orderData.totalsum, orderId], (updateErr) => {
      if (updateErr) {
        console.error('Ошибка при изменении суммы счета: ' + updateErr.message);
        res.status(500).json({ error: 'Ошибка при изменении суммы счета' });
        return;
      }

      console.log('Заказ успешно создан, id: ' + orderId);
      res.status(201).json({ message: 'Заказ успешно создан', orderId });
    });
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});



//Часть 2

// API endpoint для создания и редактирования профиля курьера
app.post('/api/courier/profile', (req, res) => {
  const courierData = req.body;

  const sql = `
    INSERT INTO courier (id_courier, Last_Name, First_Name, Middle_name, Email_courier, courier_phone, requisites_courier, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE Last_Name = VALUES(Last_Name), First_Name = VALUES(First_Name), Middle_name = VALUES(Middle_name), 
    Email_courier = VALUES(Email_courier), courier_phone = VALUES(Номер_телефоcourier_phoneна), requisites_courier = VALUES(requisites_courier), 
    password_hash = VALUES(password_hash);
  `;

  db.query(sql, [
    courierData.id_courier,
    courierData.Last_Name,
    courierData.First_Name,
    courierData.Middle_name,
    courierData.Email_courier,
    courierData.courier_phone,
    courierData.requisites_courier,
    courierData.password_hash,
  ], (err, result) => {
    if (err) {
      console.error('Ошибка при создании/редактировании профиля курьера: ' + err.message);
      res.status(500).json({ error: 'Ошибка при создании/редактировании профиля курьера' });
      return;
    }

    console.log('Профиль курьера успешно создан/отредактирован, id: ' + result.insertId);
    res.status(201).json({ message: 'Профиль курьера успешно создан/отредактирован', courierId: result.insertId });
  });
});


// API endpoint для получения всех заказов со статусом "Поиск исполнителя"
app.get('/api/courier/orders', (req, res) => {
  const sql = 'SELECT * FROM Order WHERE status_id_status = ?';

  db.query(sql, ['Поиск исполнителя'], (err, result) => {
    if (err) {
      console.error('Ошибка при получении заказов: ' + err.message);
      res.status(500).json({ error: 'Ошибка при получении заказов' });
      return;
    }

    res.status(200).json(result);
  });
});


// API endpoint для принятия заказа (добавления исполнителя)
app.post('/api/courier/orders/accept/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const courierId = req.body.courierId;

  const sql = 'UPDATE Order SET courier_id_courier = ?, status_id_status = ? WHERE id_order = ?';

  db.query(sql, [courierId, 'Принят', orderId], (err, result) => {
    if (err) {
      console.error('Ошибка при принятии заказа: ' + err.message);
      res.status(500).json({ error: 'Ошибка при принятии заказа' });
      return;
    }

    console.log('Заказ успешно принят курьером, id: ' + orderId);
    res.status(200).json({ message: 'Заказ успешно принят курьером' });
  });
});


// API endpoint для запроса на смену статуса активного заказа
app.put('/api/courier/orders/change-status/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.newStatus;

  const sql = 'UPDATE Order SET status_id_status = ? WHERE id_order = ? AND courier_id_courier IS NOT NULL';

  db.query(sql, [newStatus, orderId], (err, result) => {
    if (err) {
      console.error('Ошибка при смене статуса заказа: ' + err.message);
      res.status(500).json({ error: 'Ошибка при смене статуса заказа' });
      return;
    }

    console.log('Статус заказа успешно изменен, id: ' + orderId);
    res.status(200).json({ message: 'Статус заказа успешно изменен' });
  });
});

app.listen(port, () => {
  console.log(`Сервер курьера запущен на порту ${port}`);
});