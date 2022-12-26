interface Wallet {
  address: Buffer;
  description: string;
  link?: string;
}

const wallets: Wallet[] = [
  {
    address: Buffer.from('2640cd6d652ac94dc5f0963dcc00bcc7', 'hex'),
    description: 'Engineering Fund, tool-scrubbers-guild',
    link: 'https://github.com/OLSF/tool-scrubbers-guild',
  },
  {
    address: Buffer.from('c906f67f626683b77145d1f20c1a753b', 'hex'),
    description: 'The Iqlusion Engineering Program',
    link: 'https://0l.network/community/community-programs/the-iqlusion-engineering-program',
  },
  {
    address: Buffer.from('3a6c51a0b786d644590e8a21591fa8e2', 'hex'),
    description: 'FTW: Ongoing Full-Time Workers Program',
    link: 'https://0l.network/community/community-programs/ftw-ongoing-full-time-workers-program',
  },
  {
    address: Buffer.from('bca50d10041fa111d1b44181a264a599', 'hex'),
    description: 'A Good List',
    link: 'https://0l.network/community/community-programs/a-good-list',
  },
  {
    address: Buffer.from('2b0e8325dea5be93d856cfde2d0cba12', 'hex'),
    description: 'Tip Jar',
    link: 'https://0l.network/community/community-programs/tip-jar',
  },
  {
    address: Buffer.from('19e966bfa4b32ce9b7e23721b37b96d2', 'hex'),
    description: 'Social Infrastructure Program',
    link: 'https://0l.network/community/community-programs/social-infrastructure-program',
  },
  {
    address: Buffer.from('b31bd7796bc113013a2bf6c3953305fd', 'hex'),
    description: 'Danish Red Cross Humanitarian Fund',
    link: 'https://0l.network/community/community-programs/danish-red-cross-humanitarian-fund',
  },
  {
    address: Buffer.from('bc25f79fef8a981be4636ac1a2d6f587', 'hex'),
    description: 'Application Studio',
    link: 'https://0l.network/community/community-programs/application-studio',
  },
  {
    address: Buffer.from('2057bcfb0189b7fd0aba7244ba271661', 'hex'),
    description: 'Moonshot Program',
    link: 'https://0l.network/community/community-programs/moonshot-program',
  },
  {
    address: Buffer.from('f605fe7f787551eea808ee9acdb98897', 'hex'),
    description: 'Human Rewards Program',
    link: 'https://0l.network/community/community-programs/human-rewards-program',
  },
  {
    address: Buffer.from('c19c06a592911ed31c4100e9fb63ad7b', 'hex'),
    description: 'RxC Research and Experimentation (0L Fund)',
    link: 'https://0l.network/community/community-programs/rxc-research-and-experimentation-0l-fund',
  },
  {
    address: Buffer.from('1367b68c86cb27fa7215d9f75a26eb8f', 'hex'),
    description: 'University of Toronto MSRG',
    link: 'https://0l.network/community/community-programs/university-of-toronto-msrg',
  },
  {
    address: Buffer.from('bb6926434d1497a559e4f0487f79434f', 'hex'),
    description: 'Deep Technology Innovation Program',
    link: 'https://0l.network/community/community-programs/deep-technology-innovation-program',
  },
  {
    address: Buffer.from('87dc2e497ac6edab21511333a421e5a5', 'hex'),
    description: 'Working Group Key Roles',
  },
];

export default wallets;
