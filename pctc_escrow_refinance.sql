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
-- Table structure for table `pctc_escrow_refinance`
--

CREATE TABLE `pctc_escrow_refinance` (
  `escrow_ref_id_pk` int(11) NOT NULL,
  `county` varchar(100) DEFAULT NULL,
  `min_range` int(21) DEFAULT NULL,
  `max_range` int(21) DEFAULT NULL,
  `escrow_rate` int(11) DEFAULT NULL,
  `status` int(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `pctc_escrow_refinance`
--

INSERT INTO `pctc_escrow_refinance` (`escrow_ref_id_pk`, `county`, `min_range`, `max_range`, `escrow_rate`, `status`, `created_at`, `modified_at`) VALUES
(1, 'Orange__All', 0, 250000, 525, 0, '2019-12-11 14:38:41', '2020-03-25 13:15:05'),
(2, 'Riverside__All', 0, 250000, 525, 1, '2019-12-11 14:39:25', NULL),
(3, 'San Bernardino__All', 0, 250000, 525, 1, '2019-12-16 13:41:16', NULL),
(4, 'Los Angeles County__All', 0, 250000, 525, 1, '2019-12-16 13:42:13', NULL),
(5, 'Ventura County__All', 0, 250000, 525, 1, '2019-12-16 13:42:51', '2020-01-28 01:01:04'),
(6, 'San Diego__All', 0, 250000, 525, 1, '2019-12-16 13:43:22', NULL),
(7, 'Orange__All', 250001, 500000, 575, 1, '2019-12-16 13:45:32', NULL),
(8, 'Riverside__All', 250001, 500000, 575, 1, '2019-12-16 13:45:58', NULL),
(9, 'San Bernardino__All', 250001, 500000, 575, 1, '2019-12-16 13:45:58', NULL),
(10, 'Los Angeles County__All', 250001, 500000, 575, 1, '2019-12-16 13:45:58', NULL),
(11, 'Ventura County__All', 250001, 500000, 575, 1, '2019-12-16 13:45:58', '2020-01-28 01:01:23'),
(12, 'San Diego__All', 250001, 500000, 575, 1, '2019-12-16 13:45:58', NULL),
(13, 'Orange__All', 500001, 750000, 675, 1, '2019-12-16 13:51:21', NULL),
(14, 'Riverside__All', 500001, 750000, 675, 1, '2019-12-16 13:51:26', NULL),
(15, 'San Bernardino__All', 500001, 750000, 675, 1, '2019-12-16 13:51:39', NULL),
(16, 'Los Angeles County__All', 500001, 750000, 675, 1, '2019-12-16 13:51:45', NULL),
(17, 'Ventura County__All', 500001, 750000, 675, 1, '2019-12-16 13:51:52', '2020-01-28 01:01:37'),
(18, 'San Diego__All', 500001, 750000, 675, 1, '2019-12-16 13:51:59', NULL),
(19, 'Orange__All', 750001, 1000000, 775, 1, '2019-12-16 14:09:01', NULL),
(20, 'Riverside__All', 750001, 1000000, 775, 1, '2019-12-16 14:09:27', NULL),
(21, 'San Bernardino__All', 750001, 1000000, 775, 1, '2019-12-16 14:12:19', NULL),
(22, 'Los Angeles County__All', 750001, 1000000, 775, 1, '2019-12-16 14:12:47', '2024-03-20 00:04:35'),
(23, 'Ventura County__All', 750001, 1000000, 775, 1, '2019-12-16 14:12:53', '2020-01-28 01:02:00'),
(24, 'San Diego__All', 750001, 1000000, 775, 1, '2019-12-16 14:13:03', NULL),
(25, 'Alameda County__All', 0, 750000, 475, 1, '2019-12-16 14:41:40', NULL),
(26, 'Contra County__All', 0, 750000, 475, 1, '2019-12-16 14:41:42', NULL),
(27, 'Santa Clara County__Re-Finance', 0, 750000, 475, 1, '2019-12-16 14:41:45', NULL),
(28, 'Alameda County__All', 750001, 1200000, 575, 1, '2019-12-16 14:44:07', NULL),
(29, 'Contra County__All', 750001, 1200000, 575, 1, '2019-12-16 14:44:10', NULL),
(30, 'Santa Clara County__Re-Finance', 750001, 1200000, 575, 1, '2019-12-16 14:44:12', NULL),
(31, 'Santa Clara County__Re-Finance', 1200001, 2000000, 675, 1, '2019-12-16 14:45:26', NULL),
(32, 'Contra County__All', 1200001, 2000000, 675, 1, '2019-12-16 14:45:27', NULL),
(33, 'Alameda County__All', 1200001, 2000000, 675, 1, '2019-12-16 14:45:29', NULL),
(34, 'Alameda County__All', 2000001, NULL, 775, 1, '2019-12-16 14:47:02', NULL),
(35, 'Santa Clara County__Re-Finance', 2000001, NULL, 775, 1, '2019-12-16 14:47:03', NULL),
(36, 'Contra County__All', 2000001, NULL, 775, 1, '2019-12-16 14:47:05', NULL),
(37, 'Los Angeles County__All', 1000001, NULL, 875, 0, '2019-12-17 09:54:55', '2024-03-20 00:02:39'),
(38, 'Orange__All', 1000001, NULL, 775, 1, '2019-12-17 12:05:32', '2024-03-20 00:05:08'),
(39, 'Orange__All', 1, 250000, 525, 1, '2020-06-03 01:43:09', '2020-06-03 01:47:05'),
(40, 'Los Angeles County__All', 1000000, 2000000, 975, 0, '2023-05-31 03:05:09', '2024-03-19 23:16:31'),
(41, 'Orange__All', 1000000, 2000000, 975, 0, '2023-05-31 03:05:47', '2024-03-19 23:19:23'),
(42, 'San Diego__All', 1000000, 2000000, 975, 0, '2023-05-31 03:06:08', '2024-03-19 23:19:35'),
(43, 'San Bernardino__All', 1000000, 2000000, 975, 0, '2023-05-31 03:06:25', '2024-03-19 23:19:44'),
(44, 'Ventura__All', 1000000, 1000000, 975000, 0, '2023-05-31 03:06:45', '2024-03-19 23:19:54'),
(45, 'Riverside__All', 1000000, 2000000, 975, 0, '2023-05-31 03:07:11', '2024-03-19 23:20:14'),
(46, 'Los Angeles County__All', 2000001, 3000000, 1225, 0, '2023-05-31 03:07:59', '2024-03-19 23:16:58'),
(47, 'Orange__All', 2000001, 3000000, 1225, 0, '2023-05-31 03:08:16', '2024-03-19 23:17:08'),
(48, 'Riverside__All', 2000001, 3000000, 1225, 0, '2023-05-31 03:08:31', '2024-03-19 23:17:58'),
(49, 'Los Angeles County__All', 1000001, NULL, 775, 1, '2024-03-20 00:05:48', NULL),
(50, 'Ventura County__All', 1000001, NULL, 775, 1, '2024-03-20 00:06:17', NULL),
(51, 'San Bernardino__All', 1000001, NULL, 775, 1, '2024-03-20 00:06:44', NULL),
(52, 'San Diego__All', 1000001, NULL, 775, 1, '2024-03-20 00:07:15', NULL),
(53, 'Riverside__All', 1000001, NULL, 775, 1, '2024-03-20 00:07:49', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pctc_escrow_refinance`
--
ALTER TABLE `pctc_escrow_refinance`
  ADD PRIMARY KEY (`escrow_ref_id_pk`),
  ADD KEY `pctc_escrow_refinance_idx1` (`min_range`,`max_range`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pctc_escrow_refinance`
--
ALTER TABLE `pctc_escrow_refinance`
  MODIFY `escrow_ref_id_pk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
