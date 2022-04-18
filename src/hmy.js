const ethers = require('ethers');

// Harmony Testnet URL
var url = 'https://api.s0.b.hmny.io';

const create_wallet = () => {
	return ethers.Wallet.createRandom(url);
}

const get_wallet_data = async (privateKey) => {
	let hmyProvider = new ethers.providers.JsonRpcProvider(url);

	let wallet = new ethers.Wallet(privateKey);
	let walletSigner = wallet.connect(hmyProvider);

	let balance =  ethers.utils.formatEther(await walletSigner.getBalance());

	return {
		address: wallet.address,
		balance: balance
	};
}

const send_money = async (send_account, to_address, send_token_amount, privateKey) => {
	let gas_limit    = "0x100000";

	let wallet = new ethers.Wallet(privateKey);
	let hmyProvider = new ethers.providers.JsonRpcProvider(url);
	let walletSigner = wallet.connect(hmyProvider);

	let currentGasPrice = await hmyProvider.getGasPrice();
	let gas_price = ethers.utils.hexlify(parseInt(currentGasPrice))

	const tx = {
		from: send_account,
		to: to_address,
		value: ethers.utils.parseEther(String(send_token_amount)),
		nonce: hmyProvider.getTransactionCount(send_account, "latest"),
		gasLimit: ethers.utils.hexlify(gas_limit), // 100000
		gasPrice: gas_price
	};

	try {
		let transaction = await walletSigner.sendTransaction(tx);
		return [true, "Sent successfully!"];
	}catch(error){
		return [false, "Insufficient Funds!"];
	}
}

export { create_wallet, get_wallet_data, send_money };