CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderAnonymousId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`reporterId` int NOT NULL,
	`respondentId` int NOT NULL,
	`reporterAnonymousId` varchar(64) NOT NULL,
	`respondentAnonymousId` varchar(64) NOT NULL,
	`lastMessage` text,
	`lastMessageAt` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatRooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lostItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('lost','found') NOT NULL,
	`category` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255) NOT NULL,
	`building` varchar(100),
	`imageUrl` varchar(500),
	`imageKey` varchar(255),
	`aiCategory` varchar(50),
	`aiConfidence` decimal(3,2),
	`status` enum('active','resolved','expired') NOT NULL DEFAULT 'active',
	`points` int DEFAULT 0,
	`isUrgent` boolean DEFAULT false,
	`reportedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lostItems_id` PRIMARY KEY(`id`)
);
