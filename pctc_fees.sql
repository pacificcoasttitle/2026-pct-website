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
-- Table structure for table `pctc_fees`
--

CREATE TABLE `pctc_fees` (
  `id` int(11) NOT NULL,
  `transaction_type` varchar(10) DEFAULT NULL,
  `parent_name` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `value` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `pctc_fees`
--

INSERT INTO `pctc_fees` (`id`, `transaction_type`, `parent_name`, `name`, `value`, `status`, `created_at`, `modified_at`) VALUES
(1, 'resale', 'escrow', 'Wire fees', 200, 0, '2019-12-09 10:23:44', '2019-12-21 04:31:08'),
(2, 'refinance', 'recording', 'Doc Recording Estimate', 200, 1, '2019-12-09 10:24:05', '2020-01-28 23:35:04'),
(3, 'refinance', 'escrow', 'Notary Fee Estimate', 200, 1, '2019-12-09 17:35:17', '2020-01-28 23:32:02'),
(4, 'refinance', 'escrow', 'Mobile signin Fee', 100, 0, '2019-12-09 17:35:53', '2020-01-28 01:21:52'),
(5, 'refinance', 'recording', 'SB2 Recording Fee Charge', 275, 1, '2019-12-09 18:27:19', NULL),
(6, 'resale', 'other', 'fee_1', 200, 0, '2019-12-16 11:25:43', '2019-12-21 04:30:55'),
(7, 'resale', 'other', 'fee_2', 300, 0, '2019-12-16 11:25:43', '2019-12-21 04:30:59'),
(8, 'resale', 'recording', 'Recording Service Fee', 225, 0, '2019-12-09 10:24:05', '2019-12-21 04:31:23'),
(9, 'resale', 'other', 'test', 200, 0, '2019-12-18 16:26:04', '2019-12-18 16:26:11'),
(10, 'resale', 'escrow', 'New Loan Fee', 280, 1, '2019-12-21 04:38:11', NULL),
(11, 'resale', 'escrow', 'Mobile Signing Fee', 200, 1, '2019-12-21 04:38:44', NULL),
(12, 'resale', 'escrow', 'Document Processing Fee', 250, 1, '2019-12-21 04:39:14', NULL),
(13, 'refinance', 'recording', 'SB2 Recording Fee Charge', 275, 0, '2019-12-21 04:39:41', '2025-05-22 02:54:27'),
(14, 'refinance', 'escrow', 'Wire Fee', 30, 1, '2020-01-28 23:35:25', NULL),
(15, 'refinance', 'recording', 'Recording Service Fee', 30, 1, '2020-01-28 23:43:31', NULL),
(16, 'resale', 'other', 'Wire Fees', 35, 1, '2022-09-13 16:32:09', NULL),
(17, 'resale', 'other', 'Overnight Fee', 50, 1, '2022-09-13 16:32:24', NULL),
(18, 'resale', 'other', 'Demand Processing Fee', 150, 1, '2022-09-13 16:32:37', NULL),
(19, 'resale', 'other', 'Home Warranty Fee', 750, 1, '2022-09-13 16:32:50', NULL),
(20, 'resale', 'other', 'Natural Hazard Disclosure Report Fee', 110, 1, '2022-09-13 16:33:07', NULL),
(21, 'resale', 'other', 'TC Fee', 450, 1, '2022-09-13 16:33:20', NULL),
(22, 'refinance', 'escrow', 'Sub Escrow', 45, 1, '2023-05-31 02:58:52', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pctc_fees`
--
ALTER TABLE `pctc_fees`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pctc_fees`
--
ALTER TABLE `pctc_fees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
