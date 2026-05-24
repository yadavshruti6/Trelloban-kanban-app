import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.member.deleteMany();
  await prisma.board.deleteMany();

  const board = await prisma.board.create({
    data: {
      title: 'Product Roadmap',
      description: 'Primary workspace board for Trelloban.',
      backgroundKind: 'wallpaper',
      backgroundValue: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3',
      backgroundOverlay: 'rgba(2, 6, 23, 0.34)',
      labels: {
        create: [
          { name: 'Design', color: '#0ea5e9' },
          { name: 'Engineering', color: '#f97316' },
          { name: 'Ops', color: '#22c55e' }
        ]
      },
      members: {
        create: [
          { name: 'Alex Morgan', email: 'alex@example.com', role: 'Product Designer' },
          { name: 'Jamie Chen', email: 'jamie@example.com', role: 'Engineering Lead' },
          { name: 'Sam Patel', email: 'sam@example.com', role: 'Frontend Engineer' }
        ]
      },
      lists: {
        create: [
          {
            title: 'Backlog',
            position: 0,
            cards: {
              create: [
                {
                  title: 'Design board shell',
                  description: 'Build the responsive Trello-inspired workspace shell.',
                  position: 0,
                  dueDate: new Date('2026-05-30T00:00:00.000Z')
                },
                {
                  title: 'Build filter popover',
                  description: 'Search and filter cards by metadata.',
                  position: 1,
                  dueDate: new Date('2026-05-27T00:00:00.000Z')
                }
              ]
            }
          },
          {
            title: 'In Progress',
            position: 1,
            cards: {
              create: [{ title: 'Implement drag and drop', position: 0, dueDate: new Date('2026-05-29T00:00:00.000Z') }]
            }
          },
          {
            title: 'Done',
            position: 2,
            cards: { create: [{ title: 'Seed the database', position: 0 }] }
          }
        ]
      }
    },
    include: {
      lists: { include: { cards: true } },
      labels: true,
      members: true
    }
  });

  const [designLabel, engineeringLabel, opsLabel] = board.labels;
  const [alex, jamie, sam] = board.members;
  const [backlogList, inProgressList, doneList] = board.lists;
  const [designCard, filterCard, dragCard, seedCard] = [
    backlogList.cards[0],
    backlogList.cards[1],
    inProgressList.cards[0],
    doneList.cards[0]
  ];

  await prisma.cardLabel.createMany({
    data: [
      { cardId: designCard.id, labelId: designLabel.id },
      { cardId: designCard.id, labelId: opsLabel.id },
      { cardId: filterCard.id, labelId: engineeringLabel.id },
      { cardId: dragCard.id, labelId: designLabel.id },
      { cardId: seedCard.id, labelId: opsLabel.id }
    ]
  });

  await prisma.cardMember.createMany({
    data: [
      { cardId: designCard.id, memberId: alex.id },
      { cardId: filterCard.id, memberId: jamie.id },
      { cardId: dragCard.id, memberId: sam.id },
      { cardId: seedCard.id, memberId: jamie.id }
    ]
  });

  await prisma.checklistItem.createMany({
    data: [
      { cardId: designCard.id, title: 'Sidebar', completed: true, position: 0 },
      { cardId: designCard.id, title: 'Topbar', completed: true, position: 1 },
      { cardId: designCard.id, title: 'Board view', completed: false, position: 2 }
    ]
  });

  await prisma.activity.createMany({
    data: [
      {
        boardId: board.id,
        cardId: designCard.id,
        type: 'comment',
        description: 'Initial structure drafted.'
      },
      {
        boardId: board.id,
        cardId: dragCard.id,
        type: 'move',
        description: 'Card moved into In Progress.'
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
