# MagixFox Swap

MagixFox is a next-generation ve(3,3) DEX, inspired by Solidly, designed for deep liquidity incentives, long-term protocol alignment, and seamless cross-chain emission distribution.

---

## 🚀 Key Features

- **ve(3,3) Tokenomics**  
  Lock governance tokens to mint veNFTs, vote for pool emissions, and earn boosted rewards.

- **Incentivized Liquidity Pools**  
  Alongside standard LP pools, MagixFox offers incentivized pools that distribute additional FOX token rewards to liquidity providers.

- **Bribe System for Vote Incentives**  
  Protocols and token owners can offer bribes in any ERC20 token to encourage veFOX holders to vote for their pool. Bribes are distributed weekly after the voting round ends.

- **Flexible LP Types**  
  MagixFox supports three categories of liquidity pools:
    - 🧮 Stable LPs — optimized for non-volatile asset pairs (low slippage).
    - ⚡ Volatile LPs — designed for standard token pairs.
    - 🎲 Degen LPs — for highly volatile and speculative pairs.

  Trading fees for each LP type are fully configurable.

- **Zap — Single Token Liquidity Provision**  
  Simplify liquidity provision: deposit a single token, and MagixFox will handle the swap and pairing for you.

- **Launchpad for Token Launches**  
  New protocols can launch their tokens directly on MagixFox, bootstrapping early liquidity and user adoption.

- **Cross-Chain Emission Distribution & veNFT Mirroring**  
  Using LayerZero, MagixFox distributes weekly emissions to sidechains and mirrors veNFT balances for accurate cross-chain state representation.

- **Automated Epoch Switches**  
  Epoch transitions are handled automatically by Chainlink Automation, ensuring consistent and trustless timing.

- **Timelocker Governance Security**  
  All sensitive actions (e.g., contract upgrades, trading fee adjustments) are only possible through the Timelocker contract, which enforces a time delay to prevent unscheduled or immediate changes.

---

## 🧠 System Overview

### 🗳 Voting

- Voting happens **exclusively on the main chain**.
- veFOX holders vote on pool emissions via the **Voter Contract**.
- Protocols and token owners can incentivize votes with ERC20 bribes.
- Bribes are distributed at the end of each weekly voting round.

---

### 💸 Emissions & Cross-Chain Sync

- Emission allocations are determined by votes on the main chain.
- LayerZero synchronizes:
    - veNFT balance mirroring to sidechains.
    - Weekly emission distributions to liquidity pools on sidechains.

---

### ⚙️ Security & Automation

- **Epoch switch transactions** are automated via Chainlink Automation.
- **Protocol changes** (e.g., upgrades, fee edits) are protected by a Timelocker contract, providing the community time to review and react before any sensitive action is executed.


### 🗳️ Emission Voting & Distribution

MagixFox uses a dual voting system to fairly and securely distribute FOX emissions:

| Voting Contract     | Controlled By         | Purpose                                               |
|---------------------|------------------------|-------------------------------------------------------|
| `Voter`             | veFOX Holders         | Community-driven allocation to liquidity pools.       |
| `BluechipVoter`     | Protocol Owner        | Strategic allocation to bluechip token pairs only.    |

- **Voter Contract:**  
  veFOX holders use this contract to vote on liquidity pools. Votes determine how 50% of the total weekly FOX emissions are distributed.

- **BluechipVoter Contract:**  
  Used exclusively by the protocol owner to vote on pools that contain bluechip token pairs. This ensures strategic stability for core liquidity pools and prevents edge cases where all emissions could be redirected to random or low-value pools.

This design guarantees that:
- 50% of FOX emissions are allocated by community voting (veFOX holders).
- 50% of FOX emissions are controlled by the protocol itself via BluechipVoter.

This approach balances community participation with long-term protocol health and liquidity depth.
