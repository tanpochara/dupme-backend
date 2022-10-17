export const stakerABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_roomName',
        type: 'string',
      },
    ],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_roomName',
        type: 'string',
      },
    ],
    name: 'createRoom',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_roomName',
        type: 'string',
      },
    ],
    name: 'joinRoom',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'rooms',
    outputs: [
      {
        internalType: 'address',
        name: 'player1',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'player1_balance',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'player2',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'player2_balance',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_roomName',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_winner',
        type: 'address',
      },
    ],
    name: 'winner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
