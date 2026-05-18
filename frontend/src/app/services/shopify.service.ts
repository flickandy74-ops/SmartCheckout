import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ShopifyService {

  private storeDomain = environment.shopifyStoreDomain;

private storefrontAccessToken = environment.storefrontAccessToken;

  async getProducts() {

  const query = `
  {
    products(first: 10) {
      edges {
        node {
          id
          title
          description

          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }

          variants(first: 1) {
            edges {
              node {
                price {
                  amount
                }
              }
            }
          }

        }
      }
    }
  }
  `;

  const response = await axios.post(

    `https://${this.storeDomain}/api/2025-04/graphql.json`,

    {
      query
    },

    {
      headers: {
        'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
        'Content-Type': 'application/json'
      }
    }

  );

  console.log(response.data);

  return response.data.data.products.edges || [];

}}
    

