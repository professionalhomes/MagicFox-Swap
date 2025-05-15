const fs = require('fs');

PATH = './generatedAddresses';

task("generate-addresses", "Generate addresses with their seed and private key")
  .addOptionalParam("amount", "The amount of addresses to create (default is 10)", 10, types.int)
  .setAction(async (args) => {
    const addresses = Array.from(
      { length: args.amount ?? AMOUNT },
      () => hre.ethers.Wallet.createRandom(),
    );

    const content = [];
    const timestamp = Date.now();
    const utc = (new Date).toISOString();

    content.push(`---------- ${utc} ----------\n\n`);
    addresses.forEach((wallet, i) => {
      content.push(`----Address #${i + 1}: ${wallet.address}\n`);
      content.push(`Private Key #${i + 1}: ${wallet.privateKey}\n`);
      content.push(`-------Seed #${i + 1}: ${wallet.mnemonic.phrase}\n\n`);
    });
    content.push(`----------------------------------------------\n\n`);

    try {
      fs.writeFileSync(`${PATH}/${timestamp}-addresses.txt`, content.join(''));
    } catch (err) {
      console.error(err);
    }
  });