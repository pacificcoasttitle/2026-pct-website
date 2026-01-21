-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 20, 2026 at 01:24 PM
-- Server version: 10.6.24-MariaDB-cll-lve
-- PHP Version: 8.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pct_calculator`
--

-- --------------------------------------------------------

--
-- Table structure for table `pctc_transfer_taxes`
--

CREATE TABLE `pctc_transfer_taxes` (
  `id` int(11) NOT NULL,
  `county_id` int(11) DEFAULT 0,
  `zone_name` varchar(255) DEFAULT NULL,
  `county_tax_per_one_thousand` double(16,2) DEFAULT 0.00,
  `city_tax_per_one_thousand` double(16,2) DEFAULT 0.00,
  `status` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `pctc_transfer_taxes`
--

INSERT INTO `pctc_transfer_taxes` (`id`, `county_id`, `zone_name`, `county_tax_per_one_thousand`, `city_tax_per_one_thousand`, `status`, `created_at`, `modified_at`) VALUES
(1, 188, 'Los Angeles County', 1.10, 4.50, 1, '2021-08-18 14:55:36', '2021-08-19 15:24:33'),
(2, 161, 'Los Angeles County', 1.10, 4.50, 1, '2021-08-18 16:46:11', NULL),
(3, 202, 'Los Angeles County', 1.10, 2.20, 1, '2021-08-18 16:47:48', NULL),
(4, 204, 'Los Angeles County', 1.10, 2.20, 1, '2021-08-18 16:48:28', NULL),
(5, 214, 'Los Angeles County', 1.10, 3.00, 1, '2021-08-18 16:49:06', NULL),
(6, 314, 'Los Angeles County', 1.10, 1.10, 1, '2021-08-18 17:00:23', '2021-08-20 09:50:25'),
(7, 309, 'Orange', 1.10, 0.00, 1, '2021-08-19 11:30:44', '2023-12-05 14:43:00'),
(8, 313, 'San Bernardino', 1.10, 0.00, 1, '2021-08-19 11:31:19', '2023-12-05 14:43:37'),
(9, 74, 'Riverside', 1.10, 1.10, 1, '2021-08-19 11:31:41', NULL),
(10, 316, 'San Diego', 1.10, 0.00, 1, '2021-08-19 11:32:15', '2024-03-28 11:59:12'),
(11, 281, 'Ventura', 1.10, 0.00, 1, '2023-12-05 14:46:24', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pctc_transfer_taxes`
--
ALTER TABLE `pctc_transfer_taxes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pctc_transfer_taxes`
--
ALTER TABLE `pctc_transfer_taxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
