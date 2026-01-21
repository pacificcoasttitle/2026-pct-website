-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 20, 2026 at 01:22 PM
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
-- Table structure for table `pctc_endorsement_fee`
--

CREATE TABLE `pctc_endorsement_fee` (
  `endorse_fee_id_fk` int(11) NOT NULL,
  `endorse_name` varchar(300) DEFAULT NULL,
  `endorse_fee` int(11) DEFAULT NULL,
  `txn_type` varchar(45) DEFAULT NULL,
  `is_default` char(1) NOT NULL DEFAULT 'Y'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `pctc_endorsement_fee`
--

INSERT INTO `pctc_endorsement_fee` (`endorse_fee_id_fk`, `endorse_name`, `endorse_fee`, `txn_type`, `is_default`) VALUES
(1, 'CLTA 100-06 - Restrictions, Encroachments & Minerals', 0, 'Resale', 'Y'),
(2, 'CLTA 110.9-06 (ALTA 8.1-06) - Environmental Protection Lien', 0, 'Resale', 'Y'),
(3, 'CLTA 116-06 - Designation of Improvements, Address', 0, 'Resale', 'Y'),
(4, 'CLTA 100.12-06 - CC&R\'s, Right of Reversion', 0, 'Resale', 'N'),
(5, 'CLTA 103.3-06 - Easement, Existing Encroachment, Enforced Removal', 0, 'Resale', 'N'),
(6, 'CLTA 103.5-06 - Water Rights, Surface Damage', 0, 'Resale', 'N'),
(7, 'CLTA 111.5-06 (ALTA 6-06) - Variable Rate Mortgage', 0, 'Resale', 'N'),
(8, 'CLTA 110.9-06 (ALTA 8.1-06) - Environmental Protection Lien', 0, 'Re-finance', 'Y'),
(9, 'CLTA 100.12-06 - CC&R\'s, Right of Reversion', 0, 'Re-finance', 'N'),
(10, 'CLTA 103.5-06 - Water Rights, Surface Damage', 0, 'Re-finance', 'N');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pctc_endorsement_fee`
--
ALTER TABLE `pctc_endorsement_fee`
  ADD PRIMARY KEY (`endorse_fee_id_fk`),
  ADD KEY `pctc_endorsement_fee_idx1` (`txn_type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pctc_endorsement_fee`
--
ALTER TABLE `pctc_endorsement_fee`
  MODIFY `endorse_fee_id_fk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
