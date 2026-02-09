import { SuiClient } from '@mysten/sui.js/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verify() {
  const objectId = process.env.NEXT_PUBLIC_SUI_CAMPAIGNS_ID;
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

  if (!objectId) {
    console.error('❌ Error: NEXT_PUBLIC_SUI_CAMPAIGNS_ID is not defined.');
    console.error('Please ensure the .env.local file is correctly set up.');
    return;
  }

  console.log(`Verifying object on ${network}...`);
  console.log(`Object ID: ${objectId}`);

  const client = new SuiClient({ url: `https://fullnode.${network}.sui.io:443` });

  try {
    const response = await client.getObject({ id: objectId });
    if (response.error) {
      console.error(`❌ Error fetching object: ${response.error.code}`);
      if (response.error.code === 'notExists') {
        console.log('The object does not exist on the network. It might need to be deployed.');
      }
    } else {
      console.log('✅ Object found successfully!');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (e) {
    console.error('An unexpected error occurred:', e);
  }
}

verify();
