-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 20, 2026 at 01:23 PM
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
-- Table structure for table `pctc_escrow_resale`
--

CREATE TABLE `pctc_escrow_resale` (
  `escrow_resale_id_pk` int(11) NOT NULL,
  `county` varchar(100) DEFAULT NULL,
  `min_range` int(11) DEFAULT 0,
  `max_range` int(11) DEFAULT NULL,
  `base_amount` float DEFAULT NULL,
  `per_thousand_price` float DEFAULT NULL,
  `base_rate` float DEFAULT NULL,
  `minimum_rate` float DEFAULT NULL,
  `status` int(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `pctc_escrow_resale`
--

INSERT INTO `pctc_escrow_resale` (`escrow_resale_id_pk`, `county`, `min_range`, `max_range`, `base_amount`, `per_thousand_price`, `base_rate`, `minimum_rate`, `status`, `created_at`, `modified_at`) VALUES
(1, 'Orange__All', 0, 1500000, 500, 4, NULL, 700, 1, '2019-12-11 17:24:52', '2019-12-17 16:33:35'),
(2, 'Orange__All', 1500001, NULL, 0, 0, 0, 6500, 1, '2019-12-16 15:04:21', NULL),
(3, 'Riverside__All', 0, 1000000, 500, 4, 0, 700, 1, '2019-12-16 15:08:37', NULL),
(4, 'San Bernardino__All', 0, 1000000, 500, 4, 0, 700, 1, '2019-12-16 15:15:32', NULL),
(5, 'Riverside__All', 1000001, NULL, 0, 0, 0, 4500, 1, '2019-12-16 15:16:41', NULL),
(6, 'San Bernardino__All', 1000001, NULL, 0, 0, 0, 4500, 1, '2019-12-16 15:17:26', NULL),
(7, 'Los Angeles County__All', 0, 1000000, 500, 4, 0, 700, 1, '2019-12-16 15:18:23', NULL),
(8, 'Los Angeles County__All', 1000001, NULL, 0, 0, 0, 4500, 1, '2019-12-16 15:19:33', NULL),
(9, 'Ventura County__All', 0, 1000000, 500, 4, 0, 700, 1, '2019-12-16 15:20:05', NULL),
(10, 'Ventura County__All', 1000001, 1500000, 4500, 2, 0, 0, 1, '2019-12-16 15:20:39', NULL),
(11, 'Ventura County__All', 1500001, NULL, 0, 0, 0, 5500, 1, '2019-12-16 15:20:58', NULL),
(12, 'San Diego__All', 0, 700000, 700, 3, 0, 0, 1, '2019-12-16 15:22:32', NULL),
(13, 'San Diego__All', 700001, NULL, 0, 0, 0, 2800, 1, '2019-12-16 15:22:53', NULL),
(14, 'Alameda County__All', 0, 100000, 0, 0, 450, 0, 1, '2019-12-16 15:23:38', NULL),
(15, 'Contra County__All', 0, 100000, 0, 0, 450, 0, 1, '2019-12-16 15:24:11', NULL),
(16, 'Santa Clara County__Re-Finance', 0, 100000, 0, 0, 450, 0, 1, '2019-12-16 15:24:38', NULL),
(18, 'Alameda County__All', 100001, 200000, 450, 7.5, 0, 0, 1, '2019-12-16 15:28:40', NULL),
(19, 'Contra County__All', 100001, 200000, 450, 7.5, 0, 0, 1, '2019-12-16 15:28:43', NULL),
(20, 'Santa Clara County__Re-Finance', 100001, 200000, 450, 7.5, 0, 0, 1, '2019-12-16 15:28:45', NULL),
(21, 'Alameda County__All', 200001, 600000, 600, 5, 0, 0, 1, '2019-12-16 15:33:03', NULL),
(22, 'Contra County__All', 200001, 600000, 600, 5, 0, 0, 1, '2019-12-16 15:33:33', NULL),
(23, 'Santa Clara County__Re-Finance', 200001, 600000, 600, 5, 0, 0, 1, '2019-12-16 15:33:48', NULL),
(24, 'Alameda County__All', 600001, 800000, 1000, 2.5, NULL, NULL, 1, '2019-12-17 12:20:39', NULL),
(25, 'Contra County__All', 600001, 800000, 1000, 2.5, NULL, NULL, 1, '2019-12-17 12:21:27', NULL),
(26, 'Santa Clara County__Re-Finance', 600001, 800000, 1000, 2.5, NULL, NULL, 1, '2019-12-17 12:21:57', NULL),
(27, 'Alameda County__All', 800001, 900000, NULL, NULL, 1200, NULL, 1, '2019-12-17 12:22:47', NULL),
(28, 'Contra County__All', 800001, 900000, NULL, NULL, 1200, NULL, 1, '2019-12-17 12:23:31', NULL),
(29, 'Santa Clara County__Re-Finance', 800001, 900000, NULL, NULL, 1200, NULL, 1, '2019-12-17 12:24:12', NULL),
(30, 'Alameda County__All', 900001, 1000000, NULL, NULL, 1350, NULL, 1, '2019-12-17 12:24:51', NULL),
(31, 'Contra County__All', 900001, 1000000, NULL, NULL, 1350, NULL, 1, '2019-12-17 12:25:39', NULL),
(32, 'Santa Clara County__Re-Finance', 900001, 1000000, NULL, NULL, 1350, NULL, 1, '2019-12-17 12:25:44', NULL),
(33, 'Alameda County__All', 1000001, 1250000, NULL, NULL, 1450, NULL, 1, '2019-12-17 12:27:12', NULL),
(34, 'Contra County__All', 1000001, 1250000, NULL, NULL, 1450, NULL, 1, '2019-12-17 12:27:14', NULL),
(35, 'Santa Clara County__Re-Finance', 1000001, 1250000, NULL, NULL, 1450, NULL, 1, '2019-12-17 12:27:16', NULL),
(36, 'Alameda County__All', 1250001, 1500000, NULL, NULL, 1575, NULL, 1, '2019-12-17 12:28:28', NULL),
(37, 'Contra County__All', 1250001, 1500000, NULL, NULL, 1575, NULL, 1, '2019-12-17 12:28:34', NULL),
(38, 'Santa Clara County__Re-Finance', 1250001, 1500000, NULL, NULL, 1575, NULL, 1, '2019-12-17 12:28:46', NULL),
(39, 'Contra County__All', 1500001, 2000000, NULL, NULL, 1700, NULL, 1, '2019-12-17 12:29:59', NULL),
(40, 'Santa Clara County__Re-Finance', 1500001, 2000000, NULL, NULL, 1700, NULL, 1, '2019-12-17 12:30:08', NULL),
(41, 'Alameda County__All', 1500001, 2000000, NULL, NULL, 1700, NULL, 1, '2019-12-17 12:30:50', NULL),
(42, 'Alameda County__All', 2000001, NULL, NULL, NULL, NULL, 1700, 1, '2019-12-17 12:31:28', NULL),
(43, 'Contra County__All', 2000001, NULL, NULL, NULL, NULL, 1700, 1, '2019-12-17 12:32:28', NULL),
(44, 'Santa Clara County__Re-Finance', 2000001, NULL, NULL, NULL, NULL, 1700, 1, '2019-12-17 12:32:36', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pctc_escrow_resale`
--
ALTER TABLE `pctc_escrow_resale`
  ADD PRIMARY KEY (`escrow_resale_id_pk`),
  ADD KEY `pctc_escrow_resale_idx1` (`min_range`,`max_range`),
  ADD KEY `pctc_escrow_resale_idx2` (`county`),
  ADD KEY `pctc_escrow_resale_idx3` (`base_amount`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pctc_escrow_resale`
--
ALTER TABLE `pctc_escrow_resale`
  MODIFY `escrow_resale_id_pk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
