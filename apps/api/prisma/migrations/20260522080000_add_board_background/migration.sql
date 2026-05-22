ALTER TABLE `boards`
  ADD COLUMN `backgroundKind` VARCHAR(191) NOT NULL DEFAULT 'wallpaper',
  ADD COLUMN `backgroundValue` VARCHAR(191) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3',
  ADD COLUMN `backgroundOverlay` VARCHAR(191) NOT NULL DEFAULT 'rgba(2, 6, 23, 0.28)';
