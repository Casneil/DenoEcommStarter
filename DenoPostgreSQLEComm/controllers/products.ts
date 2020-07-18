import { Client } from "https://deno.land/x/postgres/mod.ts";
import { Product } from "../types.ts";
import { dbCreds } from "../config.ts";

// Init Client

const client = new Client(dbCreds);

// Add Product
export const addProduct = async ({ request, response }: { request: any; response: any }) => {
  const body = await request.body();
  const product = body.value;

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No Data",
    };
  } else {
    try {
      await client.connect();

      const result = await client.query("INSERT INTO products(name,description,price) VALUES($1, $2, $3)", product.name, product.description, product.price);

      response.status = 201;
      response.body = {
        success: true,
        data: product,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  }
};

// Get Products
export const getProducts = async ({ response }: { response: any }) => {
  try {
    await client.connect();
    const result = await client.query("SELECT * FROM products");
    const products = new Array();

    result.rows.map((product) => {
      let obj: any = new Object();
      result.rowDescription.columns.map((element, index) => {
        obj[element.name] = product[index];
      });

      products.push(obj);
    });

    response.body = {
      success: true,
      data: products,
    };
  } catch (error) {
    response.status = 500;
    response.body = {
      success: false,
      msg: error.toString(),
    };
  } finally {
    await client.end();
  }
};

// Get Simgle Product
export const getProduct = async ({ params, response }: { params: { id: string }; response: any }) => {
  try {
    await client.connect();
    const result = await client.query("SELECT * FROM products WHERE id = $1", params.id);
    if (result.rows.toString() === "") {
      response.status = 404;
      response.body = {
        success: false,
        msg: `No product with the id of ${params.id}`,
      };
      return;
    } else {
      const product: any = new Object();
      result.rows.map((prod) => {
        result.rowDescription.columns.map((element, index) => {
          product[element.name] = prod[index];
        });
      });
      response.body = {
        success: true,
        data: product,
      };
    }
  } catch (error) {
    response.status = 500;
    response.body = {
      success: false,
      msg: error.toString(),
    };
  } finally {
    await client.end();
  }
};

// Update Product
export const updateProduct = async ({ params, request, response }: { params: { id: string }; request: any; response: any }) => {
  await getProduct({ params: { id: params.id }, response });

  if (response.status === 404) {
    response.body = {
      success: false,
      msg: response.body.msg,
    };
    response.status = 404;
    return;
  } else {
    const body = await request.body();
    const product = body.value;

    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No Data",
      };
    } else {
      try {
        await client.connect();

        const result = await client.query("UPDATE products SET name=$1,description=$2,price=$3 WHERE id=$4", product.name, product.description, product.price, params.id);

        response.status = 200;
        response.body = {
          success: true,
          data: product,
        };
      } catch (error) {
        response.status = 500;
        response.body = {
          success: false,
          msg: error.toString(),
        };
      } finally {
        await client.end();
      }
    }
  }
};

export const deleteProduct = async ({ params, response }: { params: { id: string }; response: any }) => {
  await getProduct({ params: { id: params.id }, response });

  if (response.status === 404) {
    response.body = {
      success: false,
      msg: response.body.msg,
    };
    response.status = 404;
    return;
  } else {
    try {
      await client.connect();

      const result = await client.query("DELETE FROM products WHERE id=$1", params.id);
      response.body = {
        success: true,
        mag: `Product with id ${params.id} deleted successfully`,
      };
      response.status = 204;
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  }
};
