require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

app.get('/api/health-check', (req, res, next) => {
  db.query('select \'successfully connected\' as "message"')
    .then(result => res.json(result.rows[0]))
    .catch(err => next(err));
});

app.get('/api/products', (req, res, next) => {
  const sql = `
              select "productId", "name", "price", "image", "shortDescription"
              from "products"
              `;
  db.query(sql)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

app.get('/api/products/:productId', (req, res, next) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId) || productId < 0) {
    next(new ClientError('productId must be a positive integer', 400));
  }
  const sql = `
              select *
              from "products"
              where "productId" = $1
              `;
  const value = [productId];
  db.query(sql, value)
    .then(result => {
      if (result.rows.length !== 0) {
        res.status(200).json(result.rows[0]);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

app.get('/api/cart', (req, res, next) => {
  if (!req.session.cartId) {
    res.status(200).json([]);
  } else {
    const sql = `
                select "c"."cartItemId",
                       "c"."price",
                       "p"."productId",
                       "p"."image",
                       "p"."name",
                       "p"."shortDescription"
                  from "cartItems" as "c"
                  join "products" as "p" using ("productId")
                where  "c"."cartId" = $1
                `;
    const values = [req.session.cartId];
    db.query(sql, values)
      .then(result => res.status(200).json(result.rows))
      .catch(err => next(err));
  }
});

app.post('/api/cart', (req, res, next) => {
  const productId = parseInt(req.body.productId);
  if (isNaN(productId) || productId < 0) {
    next(new ClientError('productId must be positive integer', 400));
  }
  const sql = `
              select "price"
              from "products"
              where "productId" = $1
              `;
  const values = [productId];
  db.query(sql, values)
    .then(result => {
      if (result.rows.length === 0) {
        throw (new ClientError(`Cannot find product with productId of ${productId}`, 404));
      }
      if (req.session.cartId) {
        return { price: result.rows[0].price, cartId: req.session.cartId };
      }
      const sqlCart = `insert into "carts" ("cartId", "createdAt")
              values (default, default)
              returning "cartId"`;
      return db.query(sqlCart).then(data => {
        const returnedData = {};
        returnedData.price = result.rows[0].price;
        returnedData.cartId = data.rows[0].cartId;
        return returnedData;
      });
    })
    .then(result => {
      req.session.cartId = result.cartId;
      const sql = `
                  insert into "cartItems" ("cartId", "productId", "price")
                  values ($1, $2, $3)
                  returning "cartItemId"
      `;
      const values = [result.cartId, productId, result.price];
      return db.query(sql, values);
    })
    .then(cartItemResult => {
      const sql = `
                  select "c"."cartItemId",
                         "c"."price",
                         "p"."productId",
                         "p"."image",
                         "p"."name",
                         "p"."shortDescription"
                    from "cartItems" as "c"
                    join "products" as "p" using ("productId")
                  where "c"."cartItemId" = $1
                  `;
      const values = [cartItemResult.rows[0].cartItemId];
      return db.query(sql, values).then(result => {
        res.status(201).json(result.rows[0]);
      });
    })
    .catch(err => next(err));
});

app.post('/api/orders', (req, res, next) => {
  if (!req.session.cartId) {
    throw (new ClientError('missing shopping cart', 400));
  }
  if (!req.body.name || !req.body.lastName || !req.body.creditCard || !req.body.ccMonth || !req.body.ccYear || !req.body.ccCVV || !req.body.shippingAddress || !req.body.city || !req.body.state || !req.body.zip) {
    throw (new ClientError('Fields cannot be empty', 400));
  }
  const sql = `
              insert into "orders" ("name", "lastName", "shippingAddress", "city", "state", "zip", "creditCard", "ccMonth", "ccYear", "ccCVV", "cartId")
              values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              returning *
              `;
  const values = [req.body.name, req.body.lastName, req.body.shippingAddress, req.body.city, req.body.state, req.body.zip, req.body.creditCard, req.body.ccMonth, req.body.ccYear, req.body.ccCVV, req.session.cartId];
  db.query(sql, values)
    .then(result => {
      delete req.session.cartId;
      res.status(201).json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.delete('/api/cart/:productId-:quantity', (req, res, next) => {
  if (!req.session.cartId) {
    throw (new ClientError('Missing cartId', 404));
  }

  const productId = parseInt(req.params.productId);
  if (isNaN(productId) || productId < 1) {
    throw (new ClientError('Invalid value for productId', 400));
  }

  const cartId = req.session.cartId;

  if (req.params.quantity !== 'all') {
    const sql = `SELECT "cartItemId"
                 FROM "cartItems"
                 WHERE  "productId" = $1 AND "cartId" = $2;`;
    const values = [productId, cartId];
    return db.query(sql, values)
      .then(result => {
        const returnedData = {};
        if (result.rows.length === 0) {
          throw (new ClientError('Could not find "cartItemId" that matches query', 404));
        }
        returnedData.cartItemId = result.rows[0].cartItemId;
        return returnedData;
      })
      .then(data => {
        const itemToDelete = [];
        itemToDelete.push(data.cartItemId);
        const sql = `DELETE from "cartItems"
                     WHERE "cartItemId" = $1;`;
        db.query(sql, itemToDelete)
          .then(result => res.status(200).json({ success: 'Item removed!' }))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  } else {
    const sql = `DELETE FROM "cartItems"
                 WHERE "productId" = $1 AND "cartId" = $2;`;
    const values = [productId, cartId];
    db.query(sql, values)
      .then(result => res.status(200).json({ success: 'Items removed!' }))
      .catch(err => next(err));
  }

});

app.use('/api', (req, res, next) => {
  next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', process.env.PORT);
});
