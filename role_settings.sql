--
-- Table structure for table `role_settings`
--
-- One row per role. `stock` is a 1/0 flag the mobile app reads to decide
-- whether stock/availability is shown to users of that role.
--
-- Role values mirror the strings stored in `user`.`role`. The collation is
-- case-insensitive, so 'Dealer' and 'dealer' resolve to the same row.
--

DROP TABLE IF EXISTS `role_settings`;
CREATE TABLE `role_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `stock` tinyint(1) NOT NULL DEFAULT '0',
  `createdOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedOn` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `modifiedBy` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_settings_role` (`role`),
  CONSTRAINT `chk_role_settings_stock` CHECK (`stock` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Seed data: every role currently present in `user`.`role`.
-- Internal roles can see stock; dealers and customers cannot.
-- Change any value with:
--   UPDATE role_settings SET stock = 1 WHERE role = 'Dealer';
--

INSERT INTO `role_settings` (`role`, `stock`) VALUES
  ('SuperAdmin',     1),
  ('SuperAdmin_P',   1),
  ('Admin',          1),
  ('Production',     1),
  ('StateHead',      1),
  ('SalesManager',   1),
  ('SalesExecutive', 1),
  ('Dealer',         0),
  ('customer',       0);
