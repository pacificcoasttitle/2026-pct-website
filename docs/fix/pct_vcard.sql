-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 02, 2026 at 12:02 PM
-- Server version: 10.6.24-MariaDB-cll-lve
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pct_vcard`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity`
--

CREATE TABLE `admin_activity` (
  `id` int(11) NOT NULL,
  `admin_user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_activity`
--

INSERT INTO `admin_activity` (`id`, `admin_user_id`, `action`, `target_type`, `target_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-19 19:37:39'),
(2, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-19 20:16:11'),
(3, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-19 20:16:51'),
(4, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-19 20:23:32'),
(5, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-19 20:23:42'),
(6, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-19 20:25:40'),
(7, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-19 20:25:47'),
(8, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-19 20:25:50'),
(9, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-19 20:25:56'),
(10, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-19 20:30:44'),
(11, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-19 20:30:46'),
(12, 1, 'login', NULL, NULL, 'User logged in', '166.199.151.65', '2025-09-19 22:37:49'),
(13, 1, 'logout', NULL, NULL, 'User logged out', '166.199.151.65', '2025-09-19 22:47:11'),
(14, 1, 'login', NULL, NULL, 'User logged in', '166.199.151.65', '2025-09-19 22:47:13'),
(15, 1, 'login', NULL, NULL, 'User logged in', '166.199.151.65', '2025-09-19 23:20:43'),
(16, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 17:32:42'),
(17, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 18:39:46'),
(18, 2, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 18:39:55'),
(19, 2, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 18:40:00'),
(20, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 18:40:02'),
(21, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 18:59:03'),
(22, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 19:54:20'),
(23, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 20:07:07'),
(24, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 20:07:09'),
(25, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 20:16:47'),
(26, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 20:16:48'),
(27, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 20:24:33'),
(28, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 20:24:34'),
(29, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 20:30:22'),
(30, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 20:30:27'),
(31, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 20:50:31'),
(32, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 20:50:32'),
(33, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 21:08:57'),
(34, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 21:08:59'),
(35, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 21:18:50'),
(36, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 21:18:51'),
(37, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 21:40:44'),
(38, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 21:40:45'),
(39, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 21:59:21'),
(40, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 21:59:22'),
(41, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-22 22:04:05'),
(42, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-22 22:04:08'),
(43, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 17:53:42'),
(44, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:16:23'),
(45, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:16:24'),
(46, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:21:09'),
(47, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:21:11'),
(48, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:27:18'),
(49, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:27:19'),
(50, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:33:24'),
(51, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:33:26'),
(52, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:39:16'),
(53, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:39:17'),
(54, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:44:29'),
(55, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:44:31'),
(56, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:49:51'),
(57, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:49:52'),
(58, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 18:56:05'),
(59, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 18:56:06'),
(60, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 19:02:33'),
(61, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 19:02:35'),
(62, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 19:38:03'),
(63, 2, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 19:38:10'),
(64, 2, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 19:38:39'),
(65, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 19:38:40'),
(66, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 20:24:06'),
(67, 2, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 20:24:14'),
(68, 2, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-23 20:24:31'),
(69, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-23 20:24:34'),
(70, 1, 'login', NULL, NULL, 'User logged in', '47.180.27.83', '2025-09-25 21:09:30'),
(71, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-26 17:42:50'),
(72, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-09-26 19:05:59'),
(73, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-26 19:06:00'),
(74, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-29 17:37:35'),
(75, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-29 18:54:48'),
(76, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-09-29 21:14:29'),
(77, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-01 16:24:33'),
(78, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-01 18:33:28'),
(79, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-10-01 23:29:23'),
(80, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-10-02 03:25:48'),
(81, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-03 20:15:38'),
(82, 1, 'login', NULL, NULL, 'User logged in', '207.212.33.90', '2025-10-03 22:05:44'),
(83, 1, 'logout', NULL, NULL, 'User logged out', '207.212.33.90', '2025-10-03 22:42:57'),
(84, 1, 'login', NULL, NULL, 'User logged in', '207.212.33.90', '2025-10-03 22:43:10'),
(85, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-06 18:20:50'),
(86, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-06 21:59:12'),
(87, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-07 16:50:24'),
(88, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-07 18:28:52'),
(89, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-07 19:22:50'),
(90, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-10-07 19:33:09'),
(91, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-07 19:35:05'),
(92, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-07 20:56:07'),
(93, 1, 'login', NULL, NULL, 'User logged in', '166.199.97.53', '2025-10-07 23:12:31'),
(94, 1, 'logout', NULL, NULL, 'User logged out', '166.199.97.53', '2025-10-07 23:34:08'),
(95, 1, 'login', NULL, NULL, 'User logged in', '166.199.97.53', '2025-10-07 23:34:10'),
(96, 1, 'logout', NULL, NULL, 'User logged out', '166.199.97.53', '2025-10-08 00:00:18'),
(97, 1, 'login', NULL, NULL, 'User logged in', '166.199.97.53', '2025-10-08 00:00:20'),
(98, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-10-08 01:53:28'),
(99, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-10-15 16:14:29'),
(100, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-20 18:07:13'),
(101, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-20 18:09:43'),
(102, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-20 20:48:27'),
(103, 1, 'login', NULL, NULL, 'User logged in', '166.199.151.5', '2025-10-21 22:22:36'),
(104, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-22 17:28:58'),
(105, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-22 20:39:56'),
(106, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-24 17:48:58'),
(107, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-10-24 19:13:49'),
(108, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-24 19:13:50'),
(109, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-10-24 19:14:31'),
(110, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-24 19:14:33'),
(111, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-24 23:23:38'),
(112, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-27 16:15:59'),
(113, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-27 21:54:29'),
(114, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-10-28 17:44:04'),
(115, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-29 17:07:05'),
(116, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-10-29 21:04:36'),
(117, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-10-31 15:05:42'),
(118, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-03 20:28:49'),
(119, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-03 20:30:44'),
(120, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-03 20:31:06'),
(121, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-03 20:43:48'),
(122, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-03 20:43:56'),
(123, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-03 21:03:51'),
(124, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-03 21:04:03'),
(125, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-03 21:26:57'),
(126, 3, 'login', NULL, NULL, 'User logged in', '174.67.240.11', '2025-11-03 23:58:11'),
(127, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-04 17:02:54'),
(128, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.35', '2025-11-04 17:05:46'),
(129, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-04 17:21:21'),
(130, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.35', '2025-11-04 17:30:24'),
(131, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-04 18:15:46'),
(132, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-04 18:31:20'),
(133, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.35', '2025-11-04 18:31:29'),
(134, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-04 19:34:42'),
(135, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-04 20:05:56'),
(136, 2, 'login', NULL, NULL, 'User logged in', '76.80.61.180', '2025-11-05 15:47:54'),
(137, 2, 'login', NULL, NULL, 'User logged in', '45.59.206.19', '2025-11-05 15:51:29'),
(138, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-11-05 16:05:47'),
(139, 2, 'login', NULL, NULL, 'User logged in', '76.80.61.180', '2025-11-05 17:28:54'),
(140, 2, 'login', NULL, NULL, 'User logged in', '76.80.61.180', '2025-11-05 18:09:38'),
(141, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-05 20:24:50'),
(142, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.35', '2025-11-05 20:25:40'),
(143, 3, 'login', NULL, NULL, 'User logged in', '174.67.240.11', '2025-11-06 15:03:26'),
(144, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-06 18:37:02'),
(145, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-06 19:11:37'),
(146, 3, 'logout', NULL, NULL, 'User logged out', '12.7.76.35', '2025-11-06 19:11:42'),
(147, 3, 'login', NULL, NULL, 'User logged in', '174.67.240.11', '2025-11-06 22:26:03'),
(148, 3, 'logout', NULL, NULL, 'User logged out', '174.67.240.11', '2025-11-06 22:26:26'),
(149, 2, 'login', NULL, NULL, 'User logged in', '174.67.240.11', '2025-11-06 22:26:48'),
(150, 2, 'logout', NULL, NULL, 'User logged out', '174.67.240.11', '2025-11-06 22:27:14'),
(151, 2, 'login', NULL, NULL, 'User logged in', '76.80.61.180', '2025-11-06 23:27:55'),
(152, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-07 20:30:29'),
(153, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-10 21:29:31'),
(154, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-10 22:00:51'),
(155, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-12 18:36:15'),
(156, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-12 21:04:21'),
(157, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-13 18:01:58'),
(158, 3, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-13 19:06:34'),
(159, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-13 20:46:34'),
(160, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-17 18:40:04'),
(161, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-18 19:00:45'),
(162, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-11-18 20:16:14'),
(163, 3, 'login', NULL, NULL, 'User logged in', '174.67.240.11', '2025-11-19 19:49:40'),
(164, 3, 'logout', NULL, NULL, 'User logged out', '174.67.240.11', '2025-11-19 19:51:29'),
(165, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-19 21:22:18'),
(166, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-19 23:17:29'),
(167, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-24 17:39:16'),
(168, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-24 18:32:30'),
(169, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-24 18:32:44'),
(170, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-24 18:37:38'),
(171, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-24 19:40:30'),
(172, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-24 20:14:20'),
(173, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-24 20:14:22'),
(174, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-25 00:22:22'),
(175, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-11-26 16:05:39'),
(176, 1, 'login', NULL, NULL, 'User logged in', '107.116.170.144', '2025-11-26 17:36:42'),
(177, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-26 19:49:25'),
(178, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-26 21:08:49'),
(179, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-26 21:09:05'),
(180, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-11-26 21:24:45'),
(181, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-11-26 21:25:04'),
(182, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-01 20:49:32'),
(183, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-02 19:19:05'),
(184, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-12-04 17:52:59'),
(185, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-12-04 20:19:06'),
(186, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:06:30'),
(187, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:11:33'),
(188, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-05 18:12:08'),
(189, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:12:14'),
(190, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-05 18:14:08'),
(191, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:14:19'),
(192, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-05 18:15:26'),
(193, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:15:33'),
(194, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:28:25'),
(195, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-05 18:51:50'),
(196, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 18:51:55'),
(197, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-05 19:05:16'),
(198, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 19:05:18'),
(199, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-05 19:15:53'),
(200, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 19:16:02'),
(201, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-05 19:53:41'),
(202, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.35', '2025-12-08 20:43:37'),
(203, 2, 'login', NULL, NULL, 'User logged in', '172.90.188.7', '2025-12-09 00:17:21'),
(204, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-12-09 18:01:51'),
(205, 1, 'login', NULL, NULL, 'User logged in', '47.180.27.83', '2025-12-09 20:09:52'),
(206, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-09 21:12:12'),
(207, 1, 'login', NULL, NULL, 'User logged in', '23.240.230.25', '2025-12-10 04:54:07'),
(208, 2, 'login', NULL, NULL, 'User logged in', '172.90.188.7', '2025-12-14 13:24:36'),
(209, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-24 18:03:27'),
(210, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-29 18:06:58'),
(211, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-29 19:52:18'),
(212, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-31 17:19:06'),
(213, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-31 17:41:17'),
(214, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-31 17:57:35'),
(215, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-31 17:57:36'),
(216, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-31 18:00:47'),
(217, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-31 18:00:49'),
(218, 1, 'logout', NULL, NULL, 'User logged out', '12.7.76.75', '2025-12-31 18:03:27'),
(219, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2025-12-31 18:03:29'),
(220, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-02 18:33:10'),
(221, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-05 18:03:31'),
(222, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-05 19:01:47'),
(223, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-05 20:38:23'),
(224, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-07 17:09:56'),
(225, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-08 20:19:39'),
(226, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-12 20:12:54'),
(227, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-01-21 19:28:08'),
(228, 1, 'login', NULL, NULL, 'User logged in', '99.27.248.49', '2026-01-27 02:31:58'),
(229, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-02-12 22:45:06'),
(230, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-02-26 18:43:58'),
(231, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-02-26 20:35:19'),
(232, 1, 'login', NULL, NULL, 'User logged in', '12.7.76.75', '2026-02-26 21:39:41');

-- --------------------------------------------------------

--
-- Table structure for table `admin_sessions`
--

CREATE TABLE `admin_sessions` (
  `id` int(11) NOT NULL,
  `admin_user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_sessions`
--

INSERT INTO `admin_sessions` (`id`, `admin_user_id`, `session_token`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
(164, 1, '877af1a9b50e43a5b4958427599aa8a58aa27ea0be0c0ba148c27dcbbf8cff94', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-23 02:28:08', '2026-01-21 19:28:08'),
(165, 1, '88ed84457df65840f47caa9ea67a5e2773501c2bbd6aab13f65f369f459b1fe6', '99.27.248.49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-28 09:31:58', '2026-01-27 02:31:58'),
(166, 1, '385c0f119f82696f3c490092ff8a51967c4e92e49dae5e95509ee1df966641f1', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-14 05:45:06', '2026-02-12 22:45:06'),
(167, 1, 'd00d75e904abb8d3aa1c4f5e40f08028818b7568dff7fd69b7894fcb71395ca5', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-28 01:43:58', '2026-02-26 18:43:58'),
(168, 1, '54eddadc1e9fde4dfc04ba4ba772693d097561e2d218ca6db56d724711d058b6', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-28 03:35:18', '2026-02-26 20:35:18'),
(169, 1, 'e44354049b65d7dff393510afd08204c0ec110baf877672caaf721990a6f4fc7', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-28 04:39:41', '2026-02-26 21:39:41');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('top_level','manager') NOT NULL DEFAULT 'manager',
  `office_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(50) DEFAULT 'system'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password_hash`, `role`, `office_id`, `first_name`, `last_name`, `active`, `last_login`, `created_at`, `updated_at`, `created_by`) VALUES
(1, 'admin', 'admin@pct.com', '$2y$10$bwiLfBq5YdWxVIyj7w7cdODDl08LQ9hbBIdXHzo/Aa5as0ol.I0l2', 'top_level', NULL, 'System', 'Administrator', 1, '2026-02-26 21:39:41', '2025-09-19 19:31:03', '2026-02-26 21:39:41', 'system'),
(2, 'LAsales', 'teammeza@pct.com', '$2y$10$fqjyNwVGqRcOQ9FEku5g6u0ZB0NTnxwOOkIQJGiWF4wMrr5sLQurC', 'manager', 1, 'Team', 'Meza', 1, '2025-12-14 13:24:36', '2025-09-22 18:39:29', '2025-12-14 13:24:36', 'system'),
(3, 'neil', 'neil@pct.com', '$2y$10$aC9Cx.32xBC7dYeVJ3zqA.J7ISS1/EAJKfygc4M9.AuKBJbv5hG12', 'manager', 2, 'Neil', 'Torquato', 1, '2025-11-19 19:49:40', '2025-11-03 20:30:09', '2025-11-19 19:49:40', 'system'),
(4, 'hugo', 'hlopez@pct.com', '$2y$10$8W3PbtAQrbJAvxG8CPjD3ehqReN.K9b2Jv7tsJXqiRVK3HrLHZ34m', 'manager', 3, 'Hugo', 'Lopez', 1, NULL, '2025-11-03 20:30:42', '2025-11-03 20:30:42', 'system');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) NOT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `color`, `background_image`, `created_at`, `updated_at`) VALUES
(1, 'Sales', '#f26b2b', 'sales-bg.jpg', '2025-09-19 18:10:44', '2025-09-19 18:10:44'),
(2, 'Escrow', '#2c5aa0', 'escrow-bg.jpg', '2025-09-19 18:10:44', '2025-09-19 18:10:44'),
(3, 'Title', '#28a745', 'title-bg.jpg', '2025-09-19 18:10:44', '2025-09-19 18:10:44'),
(4, 'Administration', '#6c757d', 'admin-bg.jpg', '2025-09-19 18:10:44', '2025-09-19 18:10:44'),
(5, 'Marketing', '#00eb3b', '', '2025-10-02 05:15:02', '2025-10-02 05:15:02');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `office_id` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `sms_code` varchar(10) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `languages` text DEFAULT NULL,
  `specialties` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `qr_code_url` varchar(255) DEFAULT NULL,
  `theme_color` varchar(20) DEFAULT 'orange',
  `active` tinyint(1) DEFAULT 1,
  `featured` tinyint(1) DEFAULT 0,
  `show_qr` tinyint(1) DEFAULT 1,
  `show_social` tinyint(1) DEFAULT 1,
  `show_bio` tinyint(1) DEFAULT 1,
  `analytics_enabled` tinyint(1) DEFAULT 1,
  `view_count` int(11) DEFAULT 0,
  `save_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(100) DEFAULT 'admin',
  `website_active` tinyint(4) DEFAULT 0 COMMENT 'Enable/disable sales rep website (0=disabled, 1=enabled)',
  `website_bio` text DEFAULT NULL COMMENT 'Custom bio content for website (separate from VCard bio)',
  `website_specialties` text DEFAULT NULL COMMENT 'Areas of expertise for website display',
  `mailchimp_form_code` text DEFAULT NULL COMMENT 'Embedded Mailchimp signup form HTML code',
  `mailchimp_audience_id` varchar(50) DEFAULT NULL COMMENT 'Mailchimp audience ID for API integration',
  `website_hero_image` varchar(255) DEFAULT NULL COMMENT 'Custom hero image path for website header',
  `website_custom_title` varchar(200) DEFAULT NULL COMMENT 'Custom page title override',
  `website_meta_description` text DEFAULT NULL COMMENT 'SEO meta description for search engines',
  `website_created_at` timestamp NULL DEFAULT NULL COMMENT 'When website was first enabled',
  `website_updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last website settings update'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `slug`, `first_name`, `last_name`, `title`, `department_id`, `office_id`, `email`, `phone`, `mobile`, `sms_code`, `bio`, `photo`, `languages`, `specialties`, `linkedin`, `facebook`, `instagram`, `twitter`, `website`, `photo_url`, `background_image`, `qr_code_url`, `theme_color`, `active`, `featured`, `show_qr`, `show_social`, `show_bio`, `analytics_enabled`, `view_count`, `save_count`, `created_at`, `updated_at`, `created_by`, `website_active`, `website_bio`, `website_specialties`, `mailchimp_form_code`, `mailchimp_audience_id`, `website_hero_image`, `website_custom_title`, `website_meta_description`, `website_created_at`, `website_updated_at`) VALUES
(1, 'anthony', 'Anthony', 'Zamora', 'Sales Manager', 1, 1, 'azamora@pct.com', '', '(562) 631-6100', 'C-9', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Anthony.png', '[\"English\",\"Spanish\"]', '[\"Commercial Title\",\"Residential Escrow\",\"1031 Exchanges\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_68de073651483.png', 'glendale-office.jpg', 'anthony-zamora-qr.png', 'orange', 1, 1, 1, 1, 1, 1, 109, 0, '2025-09-19 18:11:20', '2025-12-14 13:24:48', 'admin', 0, 'Testing', '', '', '', 'assets/images/photos/hero_68d6e644954fd.jpg', '', '', '2025-09-26 18:59:08', '2025-12-14 13:24:48'),
(2, 'linda', 'LINDA', 'RUIZ', 'Account Executive', 1, 1, 'lruiz@pct.com', '', '17143086000', 'C-19', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Linda.png', '[\"English\",\"Spanish\"]', '[\"Residential Title\",\"Refinancing\",\"First-Time Buyers\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f996033f2.png', 'glendale-office.jpg', 'linda-ruiz-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-19 18:11:20', '2025-12-04 21:13:58', 'admin', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:13:58'),
(3, 'david', 'DAVID', 'GOMEZ', 'Account Executive', 1, 1, 'dgomez@pct.com', '', '(562) 619-6062', 'C-2', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'David.png', '[\"English\",\"Spanish\"]', '[\"Residential Escrow\",\"Commercial Escrow\",\"Refinancing\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/photos/david-gomez.png', 'glendale-office.jpg', 'david-gomez-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 41, 0, '2025-09-19 18:11:20', '2025-12-02 21:00:52', 'admin', 0, '', '', '', '', NULL, '', '', NULL, '2025-12-02 21:00:52'),
(4, 'simon', 'SIMON', 'WU', 'Account Executive', 1, 1, 'swu@pct.com', '', '(626) 589-8822', 'C-12', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Simon.png', '[\"English\",\"Mandarin\"]', '[\"Title Research\",\"Title Insurance\",\"Commercial Properties\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f9c13ad3d.png', 'glendale-office.jpg', 'simon-wu-qr.png', 'green', 1, 0, 1, 1, 1, 1, 14, 0, '2025-09-19 18:11:20', '2025-12-04 21:14:41', 'admin', 0, '', '', '', '', NULL, '', '', NULL, '2025-12-04 21:14:41'),
(5, 'angeline-ahn', 'ANGELINE', 'AHN', 'Vice President', 1, 2, 'awu@pct.com', '', '(949) 545-8859', 'C-23', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Angeline.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_68daf6df96140.png', 'glendale-office.jpg', 'angeline-ahn-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 49, 0, '2025-09-19 18:11:20', '2025-12-02 21:00:52', 'migration', 1, '', '', '', '', '', '', '', '2025-09-29 19:49:21', '2025-12-02 21:00:52'),
(6, 'christy-coffey', 'CHRISTY', 'COFFEY', 'Account Executive', 1, 2, 'ccoffey@pct.com', '', '19498870338', 'C-24', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Christy.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_68daf8af48327.png', 'glendale-office.jpg', 'christy-coffey-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 85, 0, '2025-09-19 18:11:20', '2025-12-19 23:15:17', 'migration', 1, '', '', '<div id=\"mc_embed_shell\">\r\n      <link href=\"//cdn-images.mailchimp.com/embedcode/classic-061523.css\" rel=\"stylesheet\" type=\"text/css\">\r\n  <style type=\"text/css\">\r\n        #mc_embed_signup{background:#fff; false;clear:left; font:14px Helvetica,Arial,sans-serif; width: 600px;}\r\n        /* Add your own Mailchimp form style overrides in your site stylesheet or in this style block.\r\n           We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */\r\n</style>\r\n<div id=\"mc_embed_signup\">\r\n    <form action=\"https://pct.us17.list-manage.com/subscribe/post?u=3f123598483b787fa180fff0f&amp;id=c3230bc1da&amp;f_id=0079bbe2f0\" method=\"post\" id=\"mc-embedded-subscribe-form\" name=\"mc-embedded-subscribe-form\" class=\"validate\" target=\"_blank\">\r\n        <div id=\"mc_embed_signup_scroll\"><h2>Subscribe</h2>\r\n            <div class=\"indicates-required\"><span class=\"asterisk\">*</span> indicates required</div>\r\n            <div class=\"mc-field-group\"><label for=\"mce-EMAIL\">Email Address <span class=\"asterisk\">*</span></label><input type=\"email\" name=\"EMAIL\" class=\"required email\" id=\"mce-EMAIL\" required=\"\" value=\"\"></div><div class=\"mc-field-group\"><label for=\"mce-FNAME\">First Name </label><input type=\"text\" name=\"FNAME\" class=\" text\" id=\"mce-FNAME\" value=\"\"></div><div class=\"mc-field-group\"><label for=\"mce-PHONE\">Phone Number </label><input type=\"text\" name=\"PHONE\" class=\"REQ_CSS\" id=\"mce-PHONE\" value=\"\"></div>\r\n        <div id=\"mce-responses\" class=\"clear\">\r\n            <div class=\"response\" id=\"mce-error-response\" style=\"display: none;\"></div>\r\n            <div class=\"response\" id=\"mce-success-response\" style=\"display: none;\"></div>\r\n        </div><div aria-hidden=\"true\" style=\"position: absolute; left: -5000px;\"><input type=\"text\" name=\"b_3f123598483b787fa180fff0f_c3230bc1da\" tabindex=\"-1\" value=\"\"></div><div class=\"clear\"><input type=\"submit\" name=\"subscribe\" id=\"mc-embedded-subscribe\" class=\"button\" value=\"Subscribe\"></div>\r\n    </div>\r\n</form>\r\n</div>\r\n<script type=\"text/javascript\" src=\"//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js\"></script><script type=\"text/javascript\">(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]=\'EMAIL\';ftypes[0]=\'email\';fnames[1]=\'FNAME\';ftypes[1]=\'text\';fnames[4]=\'PHONE\';ftypes[4]=\'phone\';fnames[2]=\'LNAME\';ftypes[2]=\'text\';fnames[3]=\'ADDRESS\';ftypes[3]=\'address\';}(jQuery));var $mcj = jQuery.noConflict(true);</script></div>', '', '', '', '', '2025-09-29 19:08:41', '2025-12-19 23:15:17'),
(7, 'corey-velasquez', 'COREY', 'VELASQUEZ', 'Account Executive', 1, 1, 'cvelasquez@pct.com', '', '16263927993', 'C-11', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Corey.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f977d0389.png', 'glendale-office.jpg', 'corey-velasquez-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 78, 0, '2025-09-19 18:11:20', '2026-01-23 02:35:44', 'migration', 1, '', '', '', '', NULL, '', '', '2025-09-29 21:23:53', '2026-01-23 02:35:44'),
(9, 'felicia-pantoja', 'FELICIA', 'PANTOJA', 'Account Executive', 1, 1, 'fpantoja@pct.com', '', '15625521229', NULL, 'Dedicated to providing exceptional title and escrow services.', 'Felicia.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'felicia-pantoja.png', 'glendale-office.jpg', 'felicia-pantoja-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 10, 0, '2025-09-19 18:11:20', '2025-12-02 21:00:52', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 21:00:52'),
(10, 'justin-nouri', 'JUSTIN', 'NOURI', 'Account Executive', 1, 1, 'jnouri@pct.com', '', '18182317265', 'C-5', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Justin.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f96ac8275.png', 'glendale-office.jpg', 'justin-nouri-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 3, 0, '2025-09-19 18:11:20', '2025-12-04 21:13:14', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:13:14'),
(12, 'lou-morreale', 'LOU', 'MORREALE', 'Account Executive', 1, 1, 'lmorreale@pct.com', '', '18188088466', 'C-13', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Lou.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f9a4db0c0.png', 'glendale-office.jpg', 'lou-morreale-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-19 18:11:20', '2025-12-04 21:14:12', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:14:12'),
(13, 'michael-nouri', 'MICHAEL', 'NOURI', 'Account Executive', 1, 1, 'mnouri@pct.com', '', '18189795150', 'C-7', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Michael.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f9d1b0072.png', 'glendale-office.jpg', 'michael-nouri-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-19 18:11:20', '2025-12-04 21:14:57', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:14:57'),
(14, 'neil-torquato', 'NEIL', 'TORQUATO', 'SVP Regional Manager', 1, 2, 'neil@pct.com', '', '(949) 278-0118', 'C-29', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Neil.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f9409d4c4.png', 'glendale-office.jpg', 'neil-torquato-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 11, 0, '2025-09-19 18:11:20', '2025-12-05 18:28:52', 'migration', 1, '', '', '', '', NULL, '', '', '2025-11-03 23:59:12', '2025-12-05 18:28:52'),
(15, 'nick-watt', 'NICK', 'WATT', 'Account Executive', 1, 1, 'nwatt@pct.com', '', '17147475189', 'C-22', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Nick.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931fa20b277c.png', 'glendale-office.jpg', 'nick-watt-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 10, 0, '2025-09-19 18:11:20', '2025-12-07 16:27:36', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-07 16:27:36'),
(16, 'richard-bohn', 'RICHARD', 'BOHN', 'AVP', 1, 2, 'rbohn@pct.com', '', '17605193115', 'C-20', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Richard.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931fa4de1471.png', 'glendale-office.jpg', 'richard-bohn-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 40, 0, '2025-09-19 18:11:20', '2026-02-26 23:23:12', 'migration', 1, '', '', '', '', NULL, '', '', '2025-11-04 17:03:41', '2026-02-26 23:23:12'),
(17, 'rouanne-garcia', 'ROUANNE', 'GARCIA', 'Account Executive', 1, 1, 'rgarcia@pct.com', '', '16265005847', 'C-10', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Rouanne.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931faa348eaf.png', 'glendale-office.jpg', 'rouanne-garcia-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 50, 0, '2025-09-19 18:11:20', '2026-01-27 18:31:27', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 18:31:27'),
(18, 'saeed-ghaffari', 'SAEED', 'GHAFFARI', 'Account Executive', 1, 1, 'sghaffari@pct.com', '', '17145550126', 'C-26', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Saeed.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/photos/saeed-ghaffari.png', 'glendale-office.jpg', 'saeed-ghaffari-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-19 18:11:20', '2025-12-02 21:00:52', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 21:00:52'),
(19, 'sandra-millar', 'SANDRA', 'MILLAR', 'Account Executive', 1, 1, 'smillar@pct.com', '', '17143232360', 'C-18', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Sandra.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931fa893e1dd.png', 'glendale-office.jpg', 'sandra-millar-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-19 18:11:20', '2025-12-04 21:18:01', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:18:01'),
(21, 'sonia-flores', 'SONIA', 'FLORES', 'Account Executive', 1, 1, 'sflores@pct.com', '', '17149437149', 'C-21', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Sonia.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931fa6647a7e.png', 'glendale-office.jpg', 'sonia-flores-qr.png', 'blue', 1, 0, 1, 1, 1, 1, 5, 0, '2025-09-19 18:11:20', '2025-12-14 13:26:18', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-14 13:26:18'),
(22, 'veronica-sanchez', 'VERONICA', 'SANCHEZ', 'Account Executive', 1, 1, 'vsanchez@pct.com', '', '18185688227', 'C-14', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'Veronica.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_6931f9b4c9ee1.png', 'glendale-office.jpg', 'veronica-sanchez-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 6, 0, '2025-09-19 18:11:20', '2025-12-04 21:14:28', 'migration', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:14:28'),
(23, 'tmg-team', 'Jorge', 'Mesa', 'Sales Manager', 1, 1, 'jmesa@pct.com', '', '(562) 343-3725', 'C-30', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', 'TMG.png', '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_68de090f7f86d.png', 'glendale-office.jpg', 'tmg-team-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 13, 0, '2025-09-19 18:11:20', '2026-01-08 20:26:58', 'migration', 1, '', '', '', '', NULL, '', '', '2025-10-01 16:25:33', '2026-01-08 20:26:58'),
(24, 'title-gals', 'Jennifer', 'Simms', 'Area Manager', 1, 1, 'jsimms@pct.com', '', '(714) 600-5136', 'C-17', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_68e02f08363e3.jpg', 'glendale-office.jpg', 'title-gals-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 179, 0, '2025-09-19 18:11:20', '2026-02-14 23:37:04', 'migration', 0, '', '', '', '', NULL, '', '', NULL, '2026-02-14 23:37:04'),
(25, 'title-boss', 'TITLE', 'BOSS', 'Sales Manager', 1, 3, 'teamlopez@pct.com', '', '(951) 858-6277', 'C-4', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, '[\"English\"]', '[\"Title Insurance\",\"Escrow Services\",\"Real Estate Transactions\"]', '', 'PacificCoastTitleCompany', 'pacificcoasttitlecompany', '', 'https://www.pct.com', 'assets/images/photos/photo_68de063dde5f1.png', 'glendale-office.jpg', 'title-boss-qr.png', 'orange', 1, 0, 1, 1, 1, 1, 3, 0, '2025-09-19 18:11:20', '2025-12-02 21:00:52', 'migration', 0, '', '', '', '', NULL, '', '', NULL, '2025-12-02 21:00:52'),
(47, 'jerry-hernandez', 'Jerry', 'Hernandez', 'Director of Product Development', 4, 1, 'ghernandez@pct.com', NULL, '(213) 309-7286', 'C-28', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68daf8cba9098.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-23 19:52:53', '2025-12-02 21:00:52', 'admin', 1, '', '', '', '', '', '', '', '2025-09-26 18:58:53', '2025-12-02 21:00:52'),
(48, 'justin-dominguez', 'Justin', 'Dominguez', 'Marketing Assistant', 4, 2, 'jdominguez@pct.com', NULL, '562-000-000', NULL, 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68d2fc8c991e6.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-09-23 20:01:16', '2025-12-04 21:10:34', 'admin', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 21:10:34'),
(49, 'jerry-hernandez-1', 'Jerry', 'Hernandez', 'Product Development Manager', 4, 2, 'marketing@pct.com', NULL, '(213) 309-7286', NULL, 'Having fun building things. ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68d2fcf04cb2c.png', NULL, NULL, 'orange', 0, 0, 1, 1, 1, 1, 0, 0, '2025-09-23 20:02:56', '2025-12-02 19:42:42', 'admin', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 19:42:42'),
(50, 'izzy-lopez', 'Izzy', 'Lopez', 'Account Executive Inland Empire', 1, 3, 'izzy4title@gmail.com', NULL, '(951) 768-2727', NULL, 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68e04c4295503.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 213, 0, '2025-10-03 22:20:50', '2026-02-26 21:48:30', 'admin', 0, '', '', '', '', '', '', '', NULL, '2026-02-26 21:48:30'),
(51, 'jesse-lopez', 'Jesse', 'Lopez', 'Account Executive', 1, 3, 'jesse4title@gmail.com', NULL, '(951) 316-4575', 'C-4', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68e04c962ff5c.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 9, 0, '2025-10-03 22:22:14', '2025-12-02 21:00:52', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-02 21:00:52'),
(52, 'nicole-ahn', 'Nicole', 'Ahn', 'VP, Account Director', 1, 1, 'titleteam@pct.com', NULL, '(626) 523-5000', 'C-16', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68e0554bd07db.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 6, 0, '2025-10-03 22:59:23', '2025-12-02 21:00:52', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-02 21:00:52'),
(53, 'edgar-rivas', 'Edgar', 'Rivas', 'Strategic Relations', 1, 1, 'erivas@pct.com', NULL, '(626) 625-6704', 'C-8', 'As a Title Representative, I\'m dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises. By combining industry knowledge with a commitment to proactive service, I provide the support and confidence needed to move from contract to close with ease.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68e443107e62d.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 7, 0, '2025-10-06 22:30:40', '2025-12-02 21:00:52', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-02 21:00:52'),
(54, 'al-alfonso', 'Al', 'Alfonso', 'President', 4, 2, 'al@pct.com', NULL, '(818) 730-1707', NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_68f808a4955d0.jpg', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 12, 0, '2025-10-21 22:23:20', '2025-10-26 04:23:53', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-10-26 04:23:53'),
(55, 'jane-phan', 'Jane', 'Phan', 'Account Executive', 1, 2, 'jphan@pct.com', NULL, '714-907-2795', 'C-25', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_691259a47fd4d.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-11-10 21:30:38', '2025-12-02 21:00:52', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-02 21:00:52'),
(56, 'ronnie-castillo', 'Ronnie', 'Castillo', 'Account Executive', 1, 1, 'Rcastillo@pct.com', NULL, '909-260-6065', 'C-6', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_6931fa34b4bc7.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-12-02 20:52:16', '2025-12-04 21:16:36', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-04 21:16:36'),
(57, 'laurie-briggs', 'Laurie', 'Briggs', 'Account Executive', 1, 2, 'lbriggs@pct.com', NULL, '949-370-9064', 'C-27', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-12-02 20:53:33', '2025-12-02 21:00:52', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-02 21:00:52'),
(58, 'michael-caballero', 'Michael', 'Caballero', 'Account Executive', 1, 3, 'Mcaballero@pct.com', NULL, '909-229-3428', 'C-15', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_6931f9e535a7e.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2025-12-02 20:54:49', '2025-12-04 21:15:17', 'admin', 0, '', '', '', '', '', '', '', NULL, '2025-12-04 21:15:17'),
(59, 'janelly-marquez', 'Janelly', 'Marquez', 'Area Manager', 1, 1, 'jmarquez@pct.com', NULL, '6262414888', 'C-31', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'assets/images/photos/photo_696556cfc852f.png', NULL, NULL, 'orange', 1, 0, 1, 1, 1, 1, 0, 0, '2026-01-12 20:17:19', '2026-01-12 20:17:19', 'admin', 0, '', '', '', '', '', '', '', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_activity`
--

CREATE TABLE `employee_activity` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `activity_type` varchar(20) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `employee_activity`
--

INSERT INTO `employee_activity` (`id`, `employee_id`, `activity_type`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
(50, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 20:47:46'),
(51, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:02:37'),
(52, 9, 'view', '35.171.45.91', 'got (https://github.com/sindresorhus/got)', '[]', '2025-09-22 21:03:12'),
(53, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:04:15'),
(54, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:04:16'),
(55, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:09:52'),
(56, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:09:55'),
(57, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:29:15'),
(58, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:29:20'),
(59, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:29:20'),
(60, 9, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:29:21'),
(61, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:29:46'),
(62, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:29:46'),
(63, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:34:51'),
(64, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:41:56'),
(65, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:42:00'),
(66, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:42:52'),
(67, 1, 'view', '35.171.45.91', 'got (https://github.com/sindresorhus/got)', '[]', '2025-09-22 21:43:01'),
(68, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:43:22'),
(69, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:47:56'),
(70, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:47:57'),
(71, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:00'),
(72, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:06'),
(73, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:06'),
(74, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:23'),
(75, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:23'),
(76, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:26'),
(77, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:48:26'),
(78, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:52:37'),
(79, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:52:37'),
(80, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:52:41'),
(81, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:52:42'),
(82, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:53:08'),
(83, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 21:57:58'),
(84, 15, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:01:55'),
(85, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:05:45'),
(86, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:05:49'),
(87, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:05:50'),
(88, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:14:42'),
(89, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:14:47'),
(90, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:16:09'),
(91, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:16:12'),
(92, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:18:09'),
(93, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:18:11'),
(94, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:18:20'),
(95, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:18:36'),
(96, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:18:39'),
(97, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:21:25'),
(98, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:21:28'),
(99, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:21:30'),
(100, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:21:34'),
(101, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:21:35'),
(102, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:26:57'),
(103, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:31:23'),
(104, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:31:31'),
(105, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:35:33'),
(106, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:35:33'),
(107, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:35:50'),
(108, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:35:50'),
(109, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:42:18'),
(110, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:42:19'),
(111, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:49:36'),
(112, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-22 22:49:37'),
(113, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 17:53:46'),
(114, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 17:53:46'),
(115, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:09:28'),
(116, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:09:43'),
(117, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:10:18'),
(118, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:21:39'),
(119, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:21:44'),
(120, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:27:05'),
(121, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:27:37'),
(122, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 18:27:40'),
(123, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:13:20'),
(124, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:23:17'),
(125, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:23:31'),
(126, 1, 'view', '35.171.45.91', 'got (https://github.com/sindresorhus/got)', '[]', '2025-09-23 19:24:37'),
(127, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:34:54'),
(128, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:43:58'),
(129, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:45:12'),
(130, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:45:57'),
(131, 3, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:46:15'),
(132, 3, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:46:16'),
(133, 7, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:58:31'),
(134, 7, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:58:31'),
(135, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:58:54'),
(136, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 19:58:55'),
(137, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:11:13'),
(138, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:11:13'),
(139, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:15:49'),
(140, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:16:27'),
(141, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:20:36'),
(142, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:21:04'),
(143, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:21:04'),
(144, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:21:18'),
(145, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:21:19'),
(146, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:26:07'),
(147, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:26:08'),
(148, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:35:37'),
(149, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-09-23 20:36:00'),
(150, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-09-23 20:36:00'),
(151, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:40:30'),
(152, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:40:30'),
(153, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:43:26'),
(154, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:43:27'),
(155, 7, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:46:38'),
(156, 7, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:46:38'),
(157, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:48:34'),
(158, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:49:15'),
(159, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:52:24'),
(160, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-23 20:52:29'),
(161, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:08:39'),
(162, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:08:39'),
(163, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:08:47'),
(164, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:09:42'),
(165, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:09:46'),
(166, 6, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:09:59'),
(167, 6, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:10:01'),
(168, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:10:29'),
(169, 1, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:10:29'),
(170, 7, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:10:34'),
(171, 7, 'view', '47.180.27.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-25 21:10:35'),
(172, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-26 18:59:50'),
(173, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-26 18:59:50'),
(174, 1, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1', '[]', '2025-09-28 13:57:38'),
(175, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 17:37:49'),
(176, 1, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 17:37:51'),
(177, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 17:38:05'),
(178, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 17:38:05'),
(179, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 17:38:25'),
(180, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 17:38:25'),
(181, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 19:48:46'),
(182, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 19:48:46'),
(183, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 19:53:14'),
(184, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 19:53:15'),
(185, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 21:14:37'),
(186, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 21:14:37'),
(187, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 21:15:13'),
(188, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-09-29 21:15:13'),
(189, 3, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 16:24:42'),
(190, 3, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 16:24:42'),
(191, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 18:33:40'),
(192, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 18:33:40'),
(193, 3, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 18:33:57'),
(194, 3, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 18:33:58'),
(195, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-01 23:31:23'),
(196, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 03:47:52'),
(197, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 03:47:52'),
(198, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 03:47:57'),
(199, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 03:58:16'),
(200, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 03:58:26'),
(201, 3, 'view', '35.171.45.91', 'got (https://github.com/sindresorhus/got)', '[]', '2025-10-02 04:00:13'),
(202, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:07:16'),
(203, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:07:20'),
(204, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:07:38'),
(205, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:07:41'),
(206, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:13:34'),
(207, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:13:39'),
(208, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:14:27'),
(209, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:14:27'),
(210, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:19:35'),
(211, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:20:41'),
(212, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:20:41'),
(213, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:21:23'),
(214, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:22:48'),
(215, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:30:41'),
(216, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:30:41'),
(217, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:38:55'),
(218, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:39:36'),
(219, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:40:18'),
(220, 24, 'view', '52.112.95.133', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-10-02 04:41:42'),
(221, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 04:44:24'),
(222, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 04:44:25'),
(223, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 04:44:34'),
(224, 24, 'view', '35.171.45.91', 'got (https://github.com/sindresorhus/got)', '[]', '2025-10-02 04:49:45'),
(225, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 04:52:39'),
(226, 3, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:53:01'),
(227, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 04:56:26'),
(228, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 04:57:56'),
(229, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 04:57:56'),
(230, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:11:59'),
(231, 17, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:12:22'),
(232, 17, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:12:22'),
(233, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:15:17'),
(234, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:15:17'),
(235, 4, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:17:41'),
(236, 24, 'view', '104.47.59.254', '', '[]', '2025-10-02 05:20:17'),
(237, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:20:17'),
(238, 24, 'view', '35.171.45.91', 'got (https://github.com/sindresorhus/got)', '[]', '2025-10-02 05:23:20'),
(239, 24, 'view', '104.47.59.254', '', '[]', '2025-10-02 05:26:18'),
(240, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:26:19'),
(241, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:26:19'),
(242, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:29:24'),
(243, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:29:24'),
(244, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', '[]', '2025-10-02 05:29:45'),
(245, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:30:13'),
(246, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-02 05:30:15'),
(247, 24, 'view', '104.47.55.254', '', '[]', '2025-10-02 05:30:33'),
(248, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:30:34'),
(249, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:30:36'),
(250, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:30:37'),
(251, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 05:30:54'),
(252, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 06:26:35'),
(253, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 06:26:37'),
(254, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-10-02 14:12:50'),
(255, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-10-02 14:12:50'),
(256, 1, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-10-02 14:17:35'),
(257, 1, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-10-02 14:17:35'),
(258, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '[]', '2025-10-02 14:17:44'),
(259, 24, 'view', '146.75.146.78', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:00:18'),
(260, 24, 'view', '146.75.146.78', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:00:19'),
(261, 24, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:01:34'),
(262, 24, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:01:34'),
(263, 24, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:02:00'),
(264, 24, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:02:00'),
(265, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:02:04'),
(266, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:02:04'),
(267, 24, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:02:09'),
(268, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:03:53'),
(269, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:03:59'),
(270, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:04:19'),
(271, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:04:51'),
(272, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:04:51'),
(273, 24, 'view', '172.226.184.126', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 16:21:13'),
(274, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 17:04:42'),
(275, 24, 'view', '12.75.215.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 18:13:37'),
(276, 24, 'view', '12.75.215.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 18:13:38'),
(277, 24, 'view', '107.115.224.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 20:02:27'),
(278, 24, 'view', '172.226.7.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 20:10:15'),
(279, 24, 'view', '107.115.224.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 20:52:11'),
(280, 24, 'view', '107.115.224.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 20:52:11'),
(281, 24, 'view', '107.115.224.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 20:52:15'),
(282, 24, 'view', '107.115.224.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 20:52:15'),
(283, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-02 22:57:29'),
(284, 24, 'view', '107.115.224.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-03 02:10:12'),
(285, 24, 'view', '107.116.170.54', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:17:07'),
(286, 24, 'view', '107.116.170.54', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:17:10'),
(287, 24, 'view', '107.116.170.54', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:17:21'),
(288, 6, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:17:54'),
(289, 6, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:17:54'),
(290, 1, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:18:48'),
(291, 1, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:18:48'),
(292, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:39:41'),
(293, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:39:42'),
(294, 5, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:40:41'),
(295, 5, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:40:41'),
(296, 5, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:40:44'),
(297, 22, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:40:53'),
(298, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:48:51'),
(299, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:48:51'),
(300, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 18:49:25'),
(301, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:04:05'),
(302, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:04:09'),
(303, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:07:28'),
(304, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:07:31'),
(305, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:14:14'),
(306, 6, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:14:45'),
(307, 6, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:14:45'),
(308, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:26:53'),
(309, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:35:36'),
(310, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:35:38'),
(311, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:35:50'),
(312, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:35:51'),
(313, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:36:39'),
(314, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:36:56'),
(315, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:36:56'),
(316, 24, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 19:37:45'),
(317, 24, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 19:37:45'),
(318, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:41:48'),
(319, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:41:48'),
(320, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:44:24'),
(321, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:44:26'),
(322, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:44:27'),
(323, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:59:00'),
(324, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:59:00');
INSERT INTO `employee_activity` (`id`, `employee_id`, `activity_type`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
(325, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:59:20'),
(326, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 19:59:22'),
(327, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:14:57'),
(328, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:14:59'),
(329, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:15:12'),
(330, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:15:12'),
(331, 24, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 20:16:14'),
(332, 24, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 20:16:14'),
(333, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:16:21'),
(334, 24, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:16:21'),
(335, 24, 'view', '172.113.156.251', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:17:25'),
(336, 24, 'view', '172.113.156.251', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:17:26'),
(337, 24, 'view', '172.113.156.251', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:17:49'),
(338, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 20:22:13'),
(339, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 20:22:14'),
(340, 24, 'view', '207.212.33.6', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:40:02'),
(341, 24, 'view', '207.212.33.6', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 20:40:02'),
(342, 5, 'view', '172.226.4.0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:41:04'),
(343, 5, 'view', '172.226.4.0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:41:04'),
(344, 5, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:41:19'),
(345, 5, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:41:19'),
(346, 7, 'view', '146.75.146.78', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:41:49'),
(347, 10, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:42:35'),
(348, 17, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:43:21'),
(349, 17, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:43:21'),
(350, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:43:56'),
(351, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:43:58'),
(352, 5, 'view', '12.75.215.121', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:44:00'),
(353, 5, 'view', '12.75.215.121', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:44:00'),
(354, 25, 'view', '146.75.146.78', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:44:15'),
(355, 22, 'view', '146.75.146.78', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:44:46'),
(356, 22, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:45:16'),
(357, 22, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:45:16'),
(358, 15, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:46:15'),
(359, 15, 'view', '97.190.15.33', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:46:50'),
(360, 15, 'view', '97.190.15.33', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:46:50'),
(361, 15, 'view', '97.190.15.33', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:51:08'),
(362, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:51:32'),
(363, 22, 'view', '35.150.129.127', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:52:57'),
(364, 22, 'view', '35.150.129.127', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:52:57'),
(365, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:58:10'),
(366, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:58:35'),
(367, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:59:16'),
(368, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 21:59:16'),
(369, 17, 'view', '76.174.41.192', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 22:03:02'),
(370, 17, 'view', '76.174.41.192', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 22:03:02'),
(371, 14, 'view', '207.212.33.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 22:09:14'),
(372, 14, 'view', '207.212.33.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 22:09:14'),
(373, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:17:19'),
(374, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:17:19'),
(375, 25, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:18:29'),
(376, 25, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:18:29'),
(377, 51, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:32:03'),
(378, 50, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:32:47'),
(379, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:36:18'),
(380, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:36:18'),
(381, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:36:26'),
(382, 50, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:39:14'),
(383, 51, 'view', '172.226.2.112', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:40:46'),
(384, 51, 'view', '172.226.2.112', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:40:46'),
(385, 50, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:41:56'),
(386, 3, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:42:29'),
(387, 51, 'view', '172.226.184.28', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:44:32'),
(388, 51, 'view', '172.226.184.28', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:44:32'),
(389, 51, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:45:39'),
(390, 3, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:46:20'),
(391, 3, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:52:17'),
(392, 50, 'view', '140.248.48.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:52:29'),
(393, 50, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:54:57'),
(394, 52, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 22:59:48'),
(395, 16, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:00:59'),
(396, 16, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:01:38'),
(397, 16, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:02:04'),
(398, 52, 'view', '47.150.111.2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 GoogleMessages/20.1', '[]', '2025-10-03 23:02:44'),
(399, 52, 'view', '47.150.111.2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', '[]', '2025-10-03 23:02:52'),
(400, 52, 'view', '47.150.111.2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36', '[]', '2025-10-03 23:02:52'),
(401, 4, 'view', '207.212.33.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 23:03:01'),
(402, 4, 'view', '207.212.33.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 23:03:02'),
(403, 4, 'view', '207.212.33.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 23:03:07'),
(404, 4, 'view', '207.212.33.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 23:03:08'),
(405, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:03:38'),
(406, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:03:39'),
(407, 4, 'view', '140.248.48.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:04:31'),
(408, 24, 'view', '207.212.33.6', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:04:59'),
(409, 24, 'view', '207.212.33.6', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:04:59'),
(410, 16, 'view', '174.243.240.56', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:05:09'),
(411, 16, 'view', '174.243.240.56', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:05:10'),
(412, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:09:10'),
(413, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:09:24'),
(414, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:14:29'),
(415, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 23:19:36'),
(416, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-03 23:19:36'),
(417, 4, 'view', '174.233.249.185', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:31:15'),
(418, 4, 'view', '174.233.249.185', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:31:15'),
(419, 4, 'view', '174.233.249.185', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:31:39'),
(420, 4, 'view', '174.233.249.185', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:32:22'),
(421, 51, 'view', '146.75.146.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:33:22'),
(422, 16, 'view', '174.243.240.56', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:35:55'),
(423, 4, 'view', '174.233.249.185', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-03 23:42:33'),
(424, 50, 'view', '68.116.247.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:03:32'),
(425, 50, 'view', '68.116.247.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:03:32'),
(426, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:41:06'),
(427, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:41:25'),
(428, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:42:41'),
(429, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:45:42'),
(430, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 00:49:53'),
(431, 17, 'view', '194.146.14.155', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 01:23:39'),
(432, 17, 'view', '35.150.151.32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 02:29:28'),
(433, 17, 'view', '35.150.151.32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 02:29:28'),
(434, 17, 'view', '35.150.151.32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 02:30:27'),
(435, 17, 'view', '35.150.151.32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 02:30:27'),
(436, 17, 'view', '35.150.151.32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 02:31:00'),
(437, 10, 'view', '76.32.38.187', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 03:26:18'),
(438, 10, 'view', '76.32.38.187', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 03:26:18'),
(439, 17, 'view', '194.146.14.153', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-04 03:30:05'),
(440, 5, 'view', '12.75.215.121', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 04:03:39'),
(441, 51, 'view', '104.28.85.108', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 04:28:39'),
(442, 17, 'view', '35.150.151.32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 04:36:07'),
(443, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-04 05:15:32'),
(444, 51, 'view', '140.248.48.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 07:11:54'),
(445, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-04 21:59:49'),
(446, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 22:16:20'),
(447, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-04 22:16:20'),
(448, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)', '[]', '2025-10-05 03:09:43'),
(449, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-05 04:46:36'),
(450, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-05 04:46:36'),
(451, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 06:07:02'),
(452, 24, 'view', '104.28.124.87', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 21:50:37'),
(453, 24, 'view', '104.28.124.87', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 21:50:37'),
(454, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:08:58'),
(455, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:08:58'),
(456, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:10:18'),
(457, 5, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:13:30'),
(458, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:28:00'),
(459, 6, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:28:02'),
(460, 6, 'view', '52.123.190.125', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-10-06 22:28:13'),
(461, 6, 'view', '107.116.170.63', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 22:29:04'),
(462, 6, 'view', '107.116.170.63', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 22:29:04'),
(463, 53, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:31:00'),
(464, 53, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-06 22:31:00'),
(465, 53, 'view', '52.123.189.140', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-10-06 22:31:09'),
(466, 53, 'view', '47.149.7.20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 22:35:23'),
(467, 53, 'view', '47.149.7.20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 22:35:23'),
(468, 17, 'view', '194.146.14.150', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 23:11:19'),
(469, 17, 'view', '194.146.14.150', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 23:11:20'),
(470, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 23:34:46'),
(471, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 23:34:46'),
(472, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 23:35:45'),
(473, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-06 23:35:45'),
(474, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:03:45'),
(475, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:57:13'),
(476, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:57:13'),
(477, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:57:13'),
(478, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:13'),
(479, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:13'),
(480, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:24'),
(481, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:24'),
(482, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:26'),
(483, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:26'),
(484, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:59'),
(485, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 02:59:59'),
(486, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 03:01:39'),
(487, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 03:01:39'),
(488, 5, 'view', '136.52.44.202', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-07 03:07:23'),
(489, 24, 'view', '23.240.230.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-07 03:41:43'),
(490, 7, 'view', '104.28.124.81', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)', '[]', '2025-10-07 05:46:56'),
(491, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 13:48:15'),
(492, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 13:48:15'),
(493, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 13:48:55'),
(494, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 13:48:55'),
(495, 4, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-07 14:26:29'),
(496, 6, 'view', '107.116.170.63', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-07 23:21:44'),
(497, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:31:41'),
(498, 24, 'view', '76.32.64.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:31:42'),
(499, 24, 'view', '66.249.80.232', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2025-10-08 16:32:10'),
(500, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:40:45'),
(501, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:40:45'),
(502, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:41:06'),
(503, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:41:06'),
(504, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:41:35'),
(505, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:41:35'),
(506, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:42:21'),
(507, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 16:42:21'),
(508, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 17:11:36'),
(509, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 17:11:37'),
(510, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 17:13:26'),
(511, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 18:37:12'),
(512, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-08 18:37:12'),
(513, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-09 04:41:52'),
(514, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-09 04:41:52'),
(515, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-09 05:23:37'),
(516, 24, 'view', '192.178.11.105', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2025-10-09 14:17:03'),
(517, 17, 'view', '194.146.14.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-10 17:31:01'),
(518, 17, 'view', '194.146.14.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-10 17:31:02'),
(519, 17, 'view', '76.174.41.192', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-10 17:35:11'),
(520, 17, 'view', '76.174.41.192', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '[]', '2025-10-10 17:35:11'),
(521, 17, 'view', '194.146.14.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-10 19:25:00'),
(522, 17, 'view', '194.146.14.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-10 19:25:00'),
(523, 17, 'view', '194.146.14.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-11 00:32:28'),
(524, 17, 'view', '194.146.14.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-11 00:32:28'),
(525, 17, 'view', '172.58.208.232', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '[]', '2025-10-11 00:33:34'),
(526, 17, 'view', '172.58.208.232', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '[]', '2025-10-11 00:33:34'),
(527, 17, 'view', '45.48.163.138', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0', '[]', '2025-10-11 05:47:33'),
(528, 17, 'view', '45.48.163.138', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0', '[]', '2025-10-11 05:47:33'),
(529, 17, 'view', '45.48.163.138', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/143.2  Mobile/15E148 Safari/604.1', '[]', '2025-10-11 05:48:06'),
(530, 17, 'view', '45.48.163.138', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/143.2  Mobile/15E148 Safari/604.1', '[]', '2025-10-11 05:48:06'),
(531, 17, 'view', '45.48.163.138', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15', '[]', '2025-10-11 05:48:20'),
(532, 17, 'view', '45.48.163.138', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/143.2  Mobile/15E148 Safari/604.1', '[]', '2025-10-11 14:58:47'),
(533, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-12 02:19:27'),
(534, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-13 03:36:51'),
(535, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-13 03:36:51'),
(536, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-13 03:38:02'),
(537, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-13 03:38:02'),
(538, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-13 20:57:06'),
(539, 7, 'view', '104.28.123.82', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-10-14 19:25:17'),
(540, 7, 'view', '104.28.123.82', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-10-14 19:25:17'),
(541, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:25:40'),
(542, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:25:40'),
(543, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-14 19:25:42'),
(544, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-14 19:25:42'),
(545, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-14 19:33:23'),
(546, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-14 19:33:23'),
(547, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-14 19:35:00'),
(548, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-14 19:35:00'),
(549, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:35:33'),
(550, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:35:34'),
(551, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:35:34'),
(552, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:35:43'),
(553, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 19:35:44'),
(554, 7, 'view', '104.28.123.80', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-10-14 20:19:25'),
(555, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-14 20:43:57'),
(556, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:10:22'),
(557, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:10:22'),
(558, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:11:32'),
(559, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:11:32'),
(560, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:11:52'),
(561, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:11:52'),
(562, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:12:13'),
(563, 6, 'view', '207.212.33.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:12:13'),
(564, 6, 'view', '12.75.215.130', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:28:45'),
(565, 6, 'view', '12.75.215.130', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 02:28:45'),
(566, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-15 03:23:31'),
(567, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-15 03:24:59'),
(568, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 06:18:34'),
(569, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0.3485.94 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 17:05:07'),
(570, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2025-10-15 18:25:43'),
(571, 7, 'view', '172.56.182.140', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 22:12:17'),
(572, 7, 'view', '172.56.182.140', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-15 22:12:17'),
(573, 6, 'view', '108.147.175.14', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-19 02:31:53'),
(574, 6, 'view', '108.147.175.14', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-19 02:31:53'),
(575, 6, 'view', '107.116.170.33', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-19 22:57:26');
INSERT INTO `employee_activity` (`id`, `employee_id`, `activity_type`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
(576, 6, 'view', '107.116.170.33', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-19 22:57:26'),
(577, 53, 'view', '172.56.178.10', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-20 17:04:53'),
(578, 53, 'view', '172.56.178.10', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-20 17:04:54'),
(579, 6, 'view', '107.116.170.33', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-20 17:53:03'),
(580, 54, 'view', '166.199.151.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-21 22:26:48'),
(581, 54, 'view', '166.199.151.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-21 22:26:49'),
(582, 54, 'view', '52.112.95.133', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-10-21 22:27:42'),
(583, 54, 'view', '104.28.123.87', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-21 22:31:11'),
(584, 54, 'view', '104.28.123.87', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-21 22:31:11'),
(585, 54, 'view', '76.89.208.221', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-21 22:40:06'),
(586, 54, 'view', '76.89.208.221', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-21 22:40:06'),
(587, 54, 'view', '76.89.208.221', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-21 22:46:10'),
(588, 54, 'view', '76.89.208.221', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-21 22:46:10'),
(589, 54, 'view', '104.28.124.86', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-22 02:11:23'),
(590, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-23 17:50:28'),
(591, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-23 17:50:28'),
(592, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-23 17:52:34'),
(593, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-23 17:52:34'),
(594, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-23 17:52:35'),
(595, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-23 17:52:35'),
(596, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', '[]', '2025-10-23 17:53:16'),
(597, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:26:55'),
(598, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:26:55'),
(599, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:26:55'),
(600, 7, 'view', '172.56.235.61', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:28:49'),
(601, 7, 'view', '172.56.235.61', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:28:49'),
(602, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:28:52'),
(603, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:29:28'),
(604, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 18:29:28'),
(605, 7, 'view', '172.56.234.225', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-23 19:02:02'),
(606, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-24 05:03:08'),
(607, 7, 'view', '70.93.229.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-10-24 14:45:37'),
(608, 4, 'view', '174.227.178.31', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-25 00:20:39'),
(609, 4, 'view', '174.227.178.31', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2025-10-25 00:20:39'),
(610, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-25 21:43:01'),
(611, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-25 21:43:01'),
(612, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-25 22:14:56'),
(613, 54, 'view', '108.147.175.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-26 04:23:43'),
(614, 54, 'view', '108.147.175.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-26 04:23:53'),
(615, 6, 'view', '76.87.9.172', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-26 04:50:19'),
(616, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-27 18:48:51'),
(617, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-27 18:48:52'),
(618, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-27 22:52:49'),
(619, 6, 'view', '107.116.170.17', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-10-27 22:52:50'),
(620, 50, 'view', '12.7.76.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-28 17:44:15'),
(621, 50, 'view', '12.7.76.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '[]', '2025-10-28 17:44:15'),
(622, 50, 'view', '52.123.190.124', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-10-28 17:44:34'),
(623, 50, 'view', '166.196.75.95', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 18:52:18'),
(624, 50, 'view', '166.196.75.95', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 18:52:24'),
(625, 50, 'view', '24.199.25.154', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 21:02:09'),
(626, 50, 'view', '166.196.75.95', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 23:00:44'),
(627, 50, 'view', '166.196.75.95', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 23:00:47'),
(628, 50, 'view', '166.196.75.95', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 23:00:48'),
(629, 50, 'view', '166.196.75.95', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-28 23:00:54'),
(630, 50, 'view', '97.190.125.214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-29 02:46:00'),
(631, 50, 'view', '97.190.125.214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-29 14:43:38'),
(632, 50, 'view', '97.190.125.214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-29 14:43:38'),
(633, 50, 'view', '97.190.125.214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-29 14:43:40'),
(634, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 02:09:06'),
(635, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 02:09:06'),
(636, 50, 'view', '107.127.56.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 06:48:42'),
(637, 17, 'view', '185.202.221.93', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 16:41:36'),
(638, 17, 'view', '185.202.221.93', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 16:41:36'),
(639, 17, 'view', '185.202.221.93', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 16:41:38'),
(640, 17, 'view', '185.202.221.93', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 16:41:38'),
(641, 17, 'view', '185.202.221.93', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 17:01:24'),
(642, 17, 'view', '185.202.221.93', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 17:01:25'),
(643, 17, 'view', '104.28.111.134', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 17:01:48'),
(644, 17, 'view', '104.28.111.134', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 17:01:48'),
(645, 17, 'view', '104.28.124.96', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', '[]', '2025-10-31 19:32:27'),
(646, 50, 'view', '173.252.83.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-10-31 21:58:49'),
(647, 50, 'view', '173.252.83.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-10-31 21:58:50'),
(648, 50, 'view', '31.13.115.10', 'Mozilla/5.0 (Linux; Android 12; SM-A217F Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.4664.104 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/530.1.0.67.107;]', '[]', '2025-10-31 21:58:51'),
(649, 50, 'view', '31.13.115.9', 'Mozilla/5.0 (Linux; Android 12; SM-A217F Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.4664.104 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/530.1.0.67.107;]', '[]', '2025-10-31 21:58:51'),
(650, 50, 'view', '97.190.125.214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23A341 Instagram 403.0.0.28.80 (iPhone16,2; iOS 26_0; en_US; en; scale=3.00; 1290x2796; IABMV/1; 808786605)', '[]', '2025-10-31 21:58:59'),
(651, 50, 'view', '97.190.125.214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23A341 Instagram 403.0.0.28.80 (iPhone16,2; iOS 26_0; en_US; en; scale=3.00; 1290x2796; IABMV/1; 808786605)', '[]', '2025-10-31 21:59:00'),
(652, 50, 'view', '69.171.230.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-03 22:55:21'),
(653, 50, 'view', '66.220.149.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0', '[]', '2025-11-03 22:55:25'),
(654, 50, 'view', '66.220.149.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0', '[]', '2025-11-03 22:55:25'),
(655, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-03 23:59:24'),
(656, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-03 23:59:24'),
(657, 14, 'view', '172.58.117.171', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '[]', '2025-11-04 01:53:53'),
(658, 14, 'view', '172.58.117.171', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '[]', '2025-11-04 01:53:54'),
(659, 21, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:48:42'),
(660, 21, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:48:42'),
(661, 21, 'view', '52.123.190.88', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-11-05 15:49:11'),
(662, 3, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:49:34'),
(663, 3, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:49:34'),
(664, 3, 'view', '52.123.190.88', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2025-11-05 15:49:52'),
(665, 23, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:50:00'),
(666, 23, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:50:00'),
(667, 23, 'view', '172.56.127.166', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:51:39'),
(668, 23, 'view', '172.56.127.166', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:51:39'),
(669, 23, 'view', '172.56.127.166', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:52:07'),
(670, 23, 'view', '172.56.127.166', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:52:08'),
(671, 3, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:53:37'),
(672, 3, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:53:37'),
(673, 1, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:54:44'),
(674, 1, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 15:54:45'),
(675, 3, 'view', '47.157.6.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.99 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:57:32'),
(676, 3, 'view', '47.157.6.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.99 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:57:32'),
(677, 3, 'view', '47.157.6.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.99 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:58:22'),
(678, 3, 'view', '47.157.6.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.99 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 15:58:22'),
(679, 3, 'view', '47.157.6.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.99 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 16:03:01'),
(680, 3, 'view', '47.157.6.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/141.0.3537.99 Version/18.0 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 16:03:01'),
(681, 5, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-05 16:06:09'),
(682, 5, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-05 16:06:09'),
(683, 5, 'view', '23.240.230.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-05 16:06:10'),
(684, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:53:42'),
(685, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:53:42'),
(686, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:54:18'),
(687, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:54:19'),
(688, 24, 'view', '66.249.80.233', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2025-11-05 17:55:40'),
(689, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:55:49'),
(690, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:55:49'),
(691, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:56:06'),
(692, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 17:56:07'),
(693, 1, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 18:09:41'),
(694, 1, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-05 18:09:41'),
(695, 24, 'view', '107.119.53.94', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:10:24'),
(696, 24, 'view', '107.119.53.94', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:10:24'),
(697, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:10:50'),
(698, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 Google-PageRenderer Google (+https://developers.google.com/+/web/snippet/)', '[]', '2025-11-05 18:16:06'),
(699, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:16:12'),
(700, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:16:12'),
(701, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:17:06'),
(702, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:17:06'),
(703, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:18:49'),
(704, 24, 'view', '47.181.186.146', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-05 18:18:49'),
(705, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 18:24:15'),
(706, 24, 'view', '107.116.170.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 18:24:15'),
(707, 24, 'view', '66.249.83.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2025-11-05 19:05:45'),
(708, 24, 'view', '107.127.56.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-05 21:59:40'),
(709, 7, 'view', '146.75.146.113', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-11-06 02:55:32'),
(710, 7, 'view', '146.75.146.113', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-11-06 02:55:32'),
(711, 7, 'view', '146.75.146.113', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-11-06 03:00:25'),
(712, 7, 'view', '146.75.146.113', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15', '[]', '2025-11-06 03:00:41'),
(713, 23, 'view', '75.35.216.144', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-06 14:27:49'),
(714, 50, 'view', '69.171.230.8', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-06 23:24:48'),
(715, 50, 'view', '31.13.115.3', 'Instagram 403.0.0.28.80 (iPhone16,2; iOS 26_0; en_US; en; scale=3.00; 1290x2796; 808786605) AppleWebKit/420+', '[]', '2025-11-06 23:24:50'),
(716, 50, 'view', '31.13.115.3', 'Instagram 403.0.0.28.80 (iPhone16,2; iOS 26_0; en_US; en; scale=3.00; 1290x2796; 808786605) AppleWebKit/420+', '[]', '2025-11-06 23:24:50'),
(717, 1, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-06 23:27:57'),
(718, 1, 'view', '76.80.61.180', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-06 23:27:57'),
(719, 23, 'view', '172.90.188.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-08 14:21:09'),
(720, 23, 'view', '172.90.188.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-08 14:21:10'),
(721, 23, 'view', '172.58.209.195', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-08 20:54:16'),
(722, 23, 'view', '172.58.209.195', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-08 20:54:17'),
(723, 50, 'view', '69.171.249.4', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 18:18:25'),
(724, 50, 'view', '69.171.249.3', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 18:18:25'),
(725, 50, 'view', '69.63.189.43', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 18:18:32'),
(726, 50, 'view', '173.252.87.10', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 18:18:32'),
(727, 50, 'view', '173.252.107.3', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 19:25:47'),
(728, 50, 'view', '173.252.107.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 19:25:47'),
(729, 50, 'view', '69.63.189.115', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-11 19:25:54'),
(730, 50, 'view', '50.112.241.247', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '[]', '2025-11-13 23:04:09'),
(731, 50, 'view', '50.112.241.247', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '[]', '2025-11-13 23:04:10'),
(732, 50, 'view', '50.112.241.247', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '[]', '2025-11-13 23:09:55'),
(733, 50, 'view', '50.112.241.247', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '[]', '2025-11-13 23:09:55'),
(734, 50, 'view', '31.13.103.116', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-14 01:46:05'),
(735, 50, 'view', '31.13.115.8', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-14 01:46:09'),
(736, 50, 'view', '31.13.115.8', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-14 01:46:10'),
(737, 50, 'view', '31.13.115.8', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-14 01:46:50'),
(738, 50, 'view', '31.13.115.8', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-14 01:46:51'),
(739, 50, 'view', '69.171.230.10', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-17 21:37:31'),
(740, 50, 'view', '66.220.149.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-17 21:37:34'),
(741, 50, 'view', '66.220.149.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-17 21:37:34'),
(742, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2025-11-19 18:23:52'),
(743, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2025-11-19 18:23:52'),
(744, 5, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-19 19:49:58'),
(745, 5, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-19 19:49:58'),
(746, 5, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-19 19:50:15'),
(747, 5, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-19 19:50:15'),
(748, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-19 19:51:07'),
(749, 14, 'view', '174.67.240.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '[]', '2025-11-19 19:51:07'),
(750, 5, 'view', '104.9.113.161', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-20 22:24:41'),
(751, 5, 'view', '104.9.113.161', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-20 22:24:41'),
(752, 50, 'view', '69.63.189.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-21 05:13:15'),
(753, 50, 'view', '173.252.70.28', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2025-11-21 05:13:17'),
(754, 50, 'view', '173.252.70.28', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2025-11-21 05:13:17'),
(755, 50, 'view', '173.252.107.5', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-21 05:13:53'),
(756, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-21 21:05:43'),
(757, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-21 21:05:43'),
(758, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', '[]', '2025-11-21 21:05:59'),
(759, 16, 'view', '174.193.130.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.148 Mobile/15E148 Safari/604.1', '[]', '2025-11-21 21:07:33'),
(760, 16, 'view', '174.193.130.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.148 Mobile/15E148 Safari/604.1', '[]', '2025-11-21 21:07:33'),
(761, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-21 21:08:14'),
(762, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-11-21 21:08:14'),
(763, 16, 'view', '174.193.130.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.148 Mobile/15E148 Safari/604.1', '[]', '2025-11-22 01:41:18'),
(764, 50, 'view', '69.171.231.20', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-24 10:38:14'),
(765, 50, 'view', '66.220.149.32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2025-11-24 10:38:36'),
(766, 50, 'view', '66.220.149.32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2025-11-24 10:38:36'),
(767, 16, 'view', '72.132.112.35', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-25 16:13:29'),
(768, 16, 'view', '72.132.112.35', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-11-25 16:13:29'),
(769, 50, 'view', '69.171.230.5', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-11-27 18:39:07'),
(770, 50, 'view', '66.220.149.47', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-27 18:39:09'),
(771, 50, 'view', '66.220.149.47', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-11-27 18:39:10'),
(772, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-01 16:43:16'),
(773, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-01 16:43:16'),
(774, 50, 'view', '69.171.230.116', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-01 20:32:05'),
(775, 50, 'view', '66.220.149.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-12-01 20:32:07'),
(776, 50, 'view', '66.220.149.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-12-01 20:32:07'),
(777, 50, 'view', '66.220.149.28', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-01 20:32:41'),
(778, 52, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-01 20:49:45'),
(779, 52, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-01 20:49:45'),
(780, 24, 'view', '76.33.52.104', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2025-12-02 04:12:51'),
(781, 24, 'view', '76.33.52.104', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2025-12-02 04:12:51'),
(782, 50, 'view', '108.147.175.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23B85 Instagram 407.0.0.31.80 (iPhone16,2; iOS 26_1; en_US; en; scale=3.00; 1290x2796; IABMV/1; 826175880) Safari/604.1', '[]', '2025-12-02 05:26:16'),
(783, 50, 'view', '108.147.175.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23B85 Instagram 407.0.0.31.80 (iPhone16,2; iOS 26_1; en_US; en; scale=3.00; 1290x2796; IABMV/1; 826175880) Safari/604.1', '[]', '2025-12-02 05:26:19'),
(784, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-12-03 16:39:45'),
(785, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-12-03 16:39:45'),
(786, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-03 16:40:37'),
(787, 16, 'view', '75.80.153.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-03 16:40:37'),
(788, 15, 'view', '174.221.191.245', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-12-04 21:04:56'),
(789, 15, 'view', '174.221.191.245', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-12-04 21:04:56'),
(790, 15, 'view', '97.218.224.160', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', '[]', '2025-12-05 01:19:38'),
(791, 50, 'view', '69.63.189.3', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-05 02:56:23'),
(792, 50, 'view', '173.252.70.112', 'Instagram 407.0.0.31.80 (iPhone16,2; iOS 26_1; en_US; en; scale=3.00; 1290x2796; 826175880) AppleWebKit/420+', '[]', '2025-12-05 02:56:26'),
(793, 50, 'view', '173.252.70.112', 'Instagram 407.0.0.31.80 (iPhone16,2; iOS 26_1; en_US; en; scale=3.00; 1290x2796; 826175880) AppleWebKit/420+', '[]', '2025-12-05 02:56:26'),
(794, 50, 'view', '35.129.74.171', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23B85 Instagram 408.1.0.45.70 (iPhone15,5; iOS 26_1; en_US; en; scale=3.00; 1290x2796; IABMV/1; 833451024) NW/3 Safari/604.1', '[]', '2025-12-05 08:15:58'),
(795, 50, 'view', '35.129.74.171', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23B85 Instagram 408.1.0.45.70 (iPhone15,5; iOS 26_1; en_US; en; scale=3.00; 1290x2796; IABMV/1; 833451024) NW/3 Safari/604.1', '[]', '2025-12-05 08:15:58'),
(796, 50, 'view', '172.58.57.234', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G100 Instagram 408.0.0.32.70 (iPhone14,2; iOS 18_6_2; en_US; en; scale=3.00; 1170x2532; IABMV/1; 830715757) Safari/604.1', '[]', '2025-12-05 19:45:27'),
(797, 50, 'view', '172.58.57.234', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G100 Instagram 408.0.0.32.70 (iPhone14,2; iOS 18_6_2; en_US; en; scale=3.00; 1170x2532; IABMV/1; 830715757) Safari/604.1', '[]', '2025-12-05 19:45:28'),
(798, 15, 'view', '174.233.243.69', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-12-07 16:27:36'),
(799, 15, 'view', '174.233.243.69', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '[]', '2025-12-07 16:27:36'),
(800, 1, 'view', '12.7.76.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-08 20:43:44'),
(801, 1, 'view', '12.7.76.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-08 20:43:44'),
(802, 50, 'view', '69.171.230.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-08 20:48:06'),
(803, 50, 'view', '173.252.87.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-08 20:48:08'),
(804, 50, 'view', '173.252.87.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '[]', '2025-12-08 20:48:08'),
(805, 50, 'view', '173.252.127.17', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2025-12-08 20:48:33'),
(806, 50, 'view', '173.252.127.17', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2025-12-08 20:48:33'),
(807, 16, 'view', '172.58.118.18', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-12-09 01:55:39'),
(808, 16, 'view', '172.58.118.18', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '[]', '2025-12-09 01:55:41'),
(809, 50, 'view', '69.171.230.112', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-11 20:02:21'),
(810, 50, 'view', '66.220.149.3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '[]', '2025-12-11 20:02:26'),
(811, 50, 'view', '66.220.149.3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '[]', '2025-12-11 20:02:26'),
(812, 1, 'view', '172.90.188.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '[]', '2025-12-14 13:24:48'),
(813, 1, 'view', '172.90.188.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '[]', '2025-12-14 13:24:48'),
(814, 21, 'view', '172.90.188.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '[]', '2025-12-14 13:26:18'),
(815, 21, 'view', '172.90.188.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '[]', '2025-12-14 13:26:18'),
(816, 50, 'view', '69.171.231.27', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-16 02:03:21'),
(817, 50, 'view', '69.63.189.41', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-16 02:03:21'),
(818, 50, 'view', '31.13.115.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2025-12-16 02:03:23'),
(819, 50, 'view', '31.13.115.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2025-12-16 02:03:24'),
(820, 50, 'view', '173.252.69.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-16 02:03:59'),
(821, 24, 'view', '76.33.52.104', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2025-12-19 19:39:01'),
(822, 24, 'view', '76.33.52.104', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2025-12-19 19:39:01'),
(823, 50, 'view', '69.171.230.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-19 21:52:58'),
(824, 50, 'view', '173.252.83.114', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-19 21:52:58'),
(825, 50, 'view', '173.252.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2025-12-19 21:52:59'),
(826, 50, 'view', '173.252.95.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2025-12-19 21:52:59'),
(827, 6, 'view', '108.147.175.116', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2025-12-19 23:15:16'),
(828, 6, 'view', '108.147.175.116', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2025-12-19 23:15:17'),
(829, 50, 'view', '66.220.149.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-24 18:30:14'),
(830, 50, 'view', '69.171.234.26', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-24 18:30:14'),
(831, 50, 'view', '173.252.127.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2025-12-24 18:30:16'),
(832, 50, 'view', '173.252.127.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2025-12-24 18:30:16'),
(833, 50, 'view', '173.252.83.8', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-24 18:30:52'),
(834, 50, 'view', '172.56.235.111', 'Mozilla/5.0 (Linux; Android 16; SM-S928U Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.34 Mobile Safari/537.36 Instagram 410.1.0.63.71 Android (36/16; 600dpi; 1440x3120; samsung; SM-S928U; e3q; qcom; en_US; 846519237; IABMV/1)', '[]', '2025-12-28 13:32:06'),
(835, 50, 'view', '172.56.235.111', 'Mozilla/5.0 (Linux; Android 16; SM-S928U Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.34 Mobile Safari/537.36 Instagram 410.1.0.63.71 Android (36/16; 600dpi; 1440x3120; samsung; SM-S928U; e3q; qcom; en_US; 846519237; IABMV/1)', '[]', '2025-12-28 13:32:06'),
(836, 50, 'view', '173.252.83.113', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-29 17:33:50'),
(837, 50, 'view', '173.252.82.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2025-12-29 17:33:51'),
(838, 50, 'view', '173.252.127.61', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2025-12-29 17:33:51');
INSERT INTO `employee_activity` (`id`, `employee_id`, `activity_type`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
(839, 50, 'view', '173.252.82.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2025-12-29 17:33:52'),
(840, 24, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2026-01-02 18:33:58'),
(841, 24, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2026-01-02 18:34:00'),
(842, 24, 'view', '52.112.95.133', 'Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com', '[]', '2026-01-02 18:34:24'),
(843, 24, 'view', '12.75.215.18', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-02 18:55:14'),
(844, 24, 'view', '12.75.215.18', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-02 18:55:18'),
(845, 50, 'view', '173.252.127.21', 'Mozilla/5.0 (Linux; Android 12; moto g22 Build/STA32.79-77-28-40; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.131 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/421.0.0.33.47;]', '[]', '2026-01-02 20:13:46'),
(846, 50, 'view', '173.252.127.112', 'Mozilla/5.0 (Linux; Android 12; moto g22 Build/STA32.79-77-28-40; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.131 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/421.0.0.33.47;]', '[]', '2026-01-02 20:13:52'),
(847, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-03 04:39:14'),
(848, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-03 04:39:14'),
(849, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-04 18:38:34'),
(850, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-04 18:38:34'),
(851, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-04 18:39:10'),
(852, 50, 'view', '69.171.231.6', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-06 01:23:56'),
(853, 50, 'view', '173.252.87.15', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2026-01-06 01:23:58'),
(854, 50, 'view', '173.252.87.16', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2026-01-06 01:23:58'),
(855, 50, 'view', '174.236.101.206', 'Mozilla/5.0 (Linux; Android 16; SM-S931U Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.34 Mobile Safari/537.36 Instagram 410.1.0.63.71 Android (36/16; 480dpi; 1080x2340; samsung; SM-S931U; pa1q; qcom; en_US; 846519237; IABMV/1)', '[]', '2026-01-06 22:09:22'),
(856, 50, 'view', '174.236.101.206', 'Mozilla/5.0 (Linux; Android 16; SM-S931U Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.34 Mobile Safari/537.36 Instagram 410.1.0.63.71 Android (36/16; 480dpi; 1080x2340; samsung; SM-S931U; pa1q; qcom; en_US; 846519237; IABMV/1)', '[]', '2026-01-06 22:09:22'),
(857, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-06 23:32:11'),
(858, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-06 23:32:11'),
(859, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-06 23:32:12'),
(860, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-06 23:32:12'),
(861, 50, 'view', '47.148.170.158', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22H31 Instagram 410.1.0.36.70 (iPhone17,2; iOS 18_7_1; en_US; en; scale=3.00; 1320x2868; IABMV/1; 849447290) NW/3 Safari/604.1', '[]', '2026-01-07 00:49:38'),
(862, 50, 'view', '47.148.170.158', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22H31 Instagram 410.1.0.36.70 (iPhone17,2; iOS 18_7_1; en_US; en; scale=3.00; 1320x2868; IABMV/1; 849447290) NW/3 Safari/604.1', '[]', '2026-01-07 00:49:38'),
(863, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-07 18:08:50'),
(864, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-07 18:08:50'),
(865, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-07 23:21:13'),
(866, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-07 23:21:13'),
(867, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 00:07:57'),
(868, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 00:07:57'),
(869, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 18:03:45'),
(870, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 18:03:48'),
(871, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 18:03:48'),
(872, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 18:16:23'),
(873, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 18:16:24'),
(874, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 19:26:26'),
(875, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 19:26:26'),
(876, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 20:19:17'),
(877, 24, 'view', '207.212.33.113', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-08 20:19:17'),
(878, 24, 'view', '66.102.7.199', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2026-01-08 20:19:27'),
(879, 23, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2026-01-08 20:26:58'),
(880, 23, 'view', '12.7.76.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2026-01-08 20:26:58'),
(881, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-09 01:57:57'),
(882, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-09 01:57:57'),
(883, 50, 'view', '69.171.230.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-09 22:43:19'),
(884, 50, 'view', '173.252.87.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', '[]', '2026-01-09 22:43:20'),
(885, 50, 'view', '173.252.87.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', '[]', '2026-01-09 22:43:20'),
(886, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-10 01:54:52'),
(887, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-10 01:54:52'),
(888, 24, 'view', '76.33.52.110', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-10 19:28:53'),
(889, 24, 'view', '108.147.175.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-12 02:53:56'),
(890, 24, 'view', '108.147.175.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', '[]', '2026-01-12 02:53:56'),
(891, 50, 'view', '69.171.230.14', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-13 19:05:29'),
(892, 50, 'view', '173.252.127.5', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2026-01-13 19:05:31'),
(893, 50, 'view', '173.252.127.5', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2026-01-13 19:05:31'),
(894, 50, 'view', '99.97.161.105', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G100 Instagram 411.3.0.30.238 (iPhone16,2; iOS 18_6_2; en_US; en; scale=3.00; 1290x2796; IABMV/1; 858646473) NW/3 Safari/604.1', '[]', '2026-01-13 20:30:47'),
(895, 50, 'view', '99.97.161.105', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G100 Instagram 411.3.0.30.238 (iPhone16,2; iOS 18_6_2; en_US; en; scale=3.00; 1290x2796; IABMV/1; 858646473) NW/3 Safari/604.1', '[]', '2026-01-13 20:30:48'),
(896, 7, 'view', '172.56.182.112', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 20:53:46'),
(897, 7, 'view', '172.56.182.112', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 20:53:46'),
(898, 7, 'view', '172.56.183.82', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 21:23:44'),
(899, 7, 'view', '172.56.183.82', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 21:23:44'),
(900, 7, 'view', '172.56.182.60', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 22:27:03'),
(901, 7, 'view', '98.154.65.13', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 22:27:36'),
(902, 7, 'view', '98.154.65.13', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 22:27:38'),
(903, 7, 'view', '172.56.183.148', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 22:45:20'),
(904, 7, 'view', '172.56.183.148', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '[]', '2026-01-15 22:45:20'),
(905, 7, 'view', '47.146.190.98', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '[]', '2026-01-16 09:45:32'),
(906, 50, 'view', '31.13.115.8', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-16 19:15:17'),
(907, 50, 'view', '173.252.82.113', 'Instagram 411.3.0.30.238 (iPhone16,2; iOS 18_6_2; en_US; en; scale=3.00; 1290x2796; 858646473) AppleWebKit/420+', '[]', '2026-01-16 19:15:27'),
(908, 50, 'view', '173.252.82.112', 'Instagram 411.3.0.30.238 (iPhone16,2; iOS 18_6_2; en_US; en; scale=3.00; 1290x2796; 858646473) AppleWebKit/420+', '[]', '2026-01-16 19:15:27'),
(909, 50, 'view', '66.220.149.44', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-19 18:18:13'),
(910, 50, 'view', '173.252.95.26', 'Instagram 411.3.0.30.238 (iPhone16,2; iOS 18_6_2; en_US; en; scale=3.00; 1290x2796; 858646473) AppleWebKit/420+', '[]', '2026-01-19 18:18:16'),
(911, 50, 'view', '173.252.95.26', 'Instagram 411.3.0.30.238 (iPhone16,2; iOS 18_6_2; en_US; en; scale=3.00; 1290x2796; 858646473) AppleWebKit/420+', '[]', '2026-01-19 18:18:16'),
(912, 50, 'view', '173.252.127.17', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-19 18:18:50'),
(913, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-21 21:26:15'),
(914, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-21 21:26:15'),
(915, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-22 01:06:28'),
(916, 7, 'view', '104.33.18.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', '[]', '2026-01-22 01:06:28'),
(917, 24, 'view', '209.184.121.89', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-01-22 17:00:59'),
(918, 24, 'view', '209.184.121.89', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-01-22 17:00:59'),
(919, 7, 'view', '172.56.241.252', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15', '[]', '2026-01-23 02:35:43'),
(920, 7, 'view', '172.56.241.252', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15', '[]', '2026-01-23 02:35:44'),
(921, 24, 'view', '207.212.33.127', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-01-23 16:37:00'),
(922, 24, 'view', '207.212.33.127', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-01-23 16:37:01'),
(923, 50, 'view', '174.195.192.245', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23C55 Instagram 413.0.0.20.79 (iPhone17,4; iOS 26_2; en_US; en; scale=3.00; 1290x2796; IABMV/1; 863488198)', '[]', '2026-01-23 17:26:37'),
(924, 50, 'view', '174.195.192.245', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23C55 Instagram 413.0.0.20.79 (iPhone17,4; iOS 26_2; en_US; en; scale=3.00; 1290x2796; IABMV/1; 863488198)', '[]', '2026-01-23 17:26:39'),
(925, 50, 'view', '69.171.230.4', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-26 19:44:49'),
(926, 50, 'view', '69.171.234.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-26 19:44:49'),
(927, 50, 'view', '31.13.127.57', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2026-01-26 19:45:02'),
(928, 50, 'view', '31.13.127.57', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '[]', '2026-01-26 19:46:07'),
(929, 17, 'view', '146.75.136.83', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2026-01-27 18:31:26'),
(930, 17, 'view', '146.75.136.83', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', '[]', '2026-01-27 18:31:27'),
(931, 50, 'view', '47.148.170.158', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23C55 Instagram 410.1.0.36.70 (iPhone17,2; iOS 26_2; en_US; en; scale=3.00; 1320x2868; IABMV/1; 849447290) Safari/604.1', '[]', '2026-01-27 23:27:48'),
(932, 50, 'view', '47.148.170.158', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23C55 Instagram 410.1.0.36.70 (iPhone17,2; iOS 26_2; en_US; en; scale=3.00; 1320x2868; IABMV/1; 849447290) Safari/604.1', '[]', '2026-01-27 23:27:48'),
(933, 50, 'view', '69.171.230.113', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-29 19:46:29'),
(934, 50, 'view', '173.252.83.113', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-01-29 19:46:30'),
(935, 50, 'view', '31.13.115.112', 'Instagram 413.0.0.20.79 (iPhone17,4; iOS 26_2; en_US; en; scale=3.00; 1290x2796; 863488198) AppleWebKit/420+', '[]', '2026-01-29 19:47:08'),
(936, 50, 'view', '31.13.115.112', 'Instagram 413.0.0.20.79 (iPhone17,4; iOS 26_2; en_US; en; scale=3.00; 1290x2796; 863488198) AppleWebKit/420+', '[]', '2026-01-29 19:47:09'),
(937, 50, 'view', '173.252.82.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', '[]', '2026-01-29 19:47:11'),
(938, 50, 'view', '173.252.82.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', '[]', '2026-01-29 19:47:12'),
(939, 50, 'view', '31.13.115.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '[]', '2026-01-29 19:50:22'),
(940, 50, 'view', '31.13.115.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '[]', '2026-01-29 19:50:45'),
(941, 50, 'view', '69.171.231.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-02 18:09:25'),
(942, 50, 'view', '173.252.87.62', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-02 18:09:25'),
(943, 50, 'view', '173.252.87.26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2026-02-02 18:09:26'),
(944, 50, 'view', '173.252.87.26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2026-02-02 18:09:26'),
(945, 50, 'view', '173.252.95.28', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2026-02-07 20:24:11'),
(946, 50, 'view', '69.171.230.7', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-07 20:24:11'),
(947, 50, 'view', '173.252.95.28', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:58.0) Gecko/20100101 Firefox/59.0', '[]', '2026-02-07 20:24:11'),
(948, 50, 'view', '173.252.79.116', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-07 20:24:12'),
(949, 50, 'view', '69.171.230.1', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-10 19:57:17'),
(950, 50, 'view', '173.252.107.15', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-10 19:57:18'),
(951, 50, 'view', '69.171.230.18', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-12 04:10:34'),
(952, 50, 'view', '69.63.189.21', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-12 04:10:34'),
(953, 50, 'view', '173.252.127.33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2026-02-12 04:10:35'),
(954, 50, 'view', '173.252.127.33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '[]', '2026-02-12 04:10:35'),
(955, 50, 'view', '173.252.127.114', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-12 04:11:16'),
(956, 24, 'view', '12.75.215.132', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-02-14 23:37:04'),
(957, 50, 'view', '173.252.107.43', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-15 11:34:50'),
(958, 50, 'view', '31.13.103.1', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-15 11:34:51'),
(959, 50, 'view', '66.220.149.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-02-15 11:34:53'),
(960, 50, 'view', '66.220.149.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-02-15 11:34:53'),
(961, 50, 'view', '69.63.189.25', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-15 11:35:28'),
(962, 50, 'view', '31.13.115.30', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-02-15 11:39:55'),
(963, 50, 'view', '31.13.115.30', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', '[]', '2026-02-15 11:39:55'),
(964, 50, 'view', '173.252.87.23', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-18 17:03:27'),
(965, 50, 'view', '173.252.79.38', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-18 17:03:27'),
(966, 50, 'view', '31.13.127.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2026-02-18 17:47:01'),
(967, 50, 'view', '31.13.127.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '[]', '2026-02-18 17:47:03'),
(968, 50, 'view', '69.63.184.40', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-18 17:47:40'),
(969, 50, 'view', '173.252.127.16', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-21 21:09:50'),
(970, 50, 'view', '69.171.230.5', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-21 21:09:50'),
(971, 50, 'view', '173.252.127.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-21 21:09:51'),
(972, 50, 'view', '173.252.127.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-21 21:09:51'),
(973, 50, 'view', '69.171.249.5', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-25 21:58:02'),
(974, 50, 'view', '69.171.234.14', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-25 21:58:02'),
(975, 50, 'view', '66.220.149.44', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-25 22:40:29'),
(976, 50, 'view', '66.220.149.50', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:06:50'),
(977, 50, 'view', '66.220.149.50', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:06:50'),
(978, 50, 'view', '31.13.127.61', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 01:07:36'),
(979, 50, 'view', '31.13.127.20', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:19:40'),
(980, 50, 'view', '31.13.127.20', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:19:40'),
(981, 50, 'view', '69.63.189.115', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 01:20:15'),
(982, 50, 'view', '31.13.115.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:23:12'),
(983, 50, 'view', '31.13.115.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:23:13'),
(984, 50, 'view', '173.252.79.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 01:23:50'),
(985, 50, 'view', '69.171.231.115', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 01:23:59'),
(986, 50, 'view', '31.13.127.24', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:33:44'),
(987, 50, 'view', '31.13.127.24', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 01:33:45'),
(988, 50, 'view', '31.13.115.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 02:04:36'),
(989, 50, 'view', '31.13.115.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 02:04:37'),
(990, 50, 'view', '69.171.249.9', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 02:05:13'),
(991, 50, 'view', '173.252.70.25', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 02:05:17'),
(992, 50, 'view', '173.252.127.62', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 12:19:26'),
(993, 50, 'view', '173.252.127.62', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '[]', '2026-02-26 12:19:27'),
(994, 50, 'view', '173.252.87.22', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 12:20:11'),
(995, 50, 'view', '173.252.95.18', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 16:15:32'),
(996, 50, 'view', '173.252.107.1', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 19:52:04'),
(997, 50, 'view', '69.171.231.24', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 20:18:37'),
(998, 50, 'view', '173.252.79.2', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 21:46:17'),
(999, 50, 'view', '69.63.184.3', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 21:46:18'),
(1000, 50, 'view', '173.252.127.27', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '[]', '2026-02-26 21:48:30'),
(1001, 16, 'view', '76.93.153.166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '[]', '2026-02-26 23:23:12'),
(1002, 16, 'view', '76.93.153.166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '[]', '2026-02-26 23:23:12');

-- --------------------------------------------------------

--
-- Table structure for table `employee_links`
--

CREATE TABLE `employee_links` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `link_type` varchar(50) NOT NULL,
  `link_label` varchar(100) NOT NULL,
  `link_url` varchar(500) NOT NULL,
  `icon` varchar(50) DEFAULT 'link',
  `display_order` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `employee_links`
--

INSERT INTO `employee_links` (`id`, `employee_id`, `link_type`, `link_label`, `link_url`, `icon`, `display_order`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 'linkedin', 'LinkedIn Profile', 'https://linkedin.com/in/testuser', '?', 0, 1, '2025-09-22 20:03:01', '2025-09-22 20:03:01'),
(2, 1, 'website', 'Personal Website', 'https://example.com', '?', 0, 1, '2025-09-22 20:03:01', '2025-09-22 20:03:01'),
(3, 1, 'email', 'Email Me', 'mailto:test@example.com', '?', 0, 1, '2025-09-22 20:03:01', '2025-09-22 20:03:01');

-- --------------------------------------------------------

--
-- Table structure for table `farm_requests`
--

CREATE TABLE `farm_requests` (
  `id` int(11) NOT NULL,
  `list_type` enum('OUT_OF_STATE','ABSENTEE_OWNER','EMPTY_NESTER','NEXT_SELLER','CENTROID','WALKING_FARM','SURNAME_FARM','CUSTOM_FARMS') NOT NULL,
  `city_area` varchar(100) NOT NULL,
  `property_address` varchar(255) DEFAULT NULL,
  `radius` enum('quarter_mile','half_mile') DEFAULT NULL,
  `list_size` enum('100_250','250_500','best_match') NOT NULL,
  `output_formats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`output_formats`)),
  `notes` text DEFAULT NULL,
  `contact_name` varchar(100) NOT NULL,
  `contact_email` varchar(100) NOT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `rep_id` varchar(20) DEFAULT NULL,
  `rep_name` varchar(100) DEFAULT NULL,
  `rep_email` varchar(100) DEFAULT NULL,
  `source_channel` varchar(20) DEFAULT 'sms',
  `user_agent` text DEFAULT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `notification_sent` tinyint(1) DEFAULT 0,
  `submitted_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `farm_requests`
--

INSERT INTO `farm_requests` (`id`, `list_type`, `city_area`, `property_address`, `radius`, `list_size`, `output_formats`, `notes`, `contact_name`, `contact_email`, `contact_phone`, `rep_id`, `rep_name`, `rep_email`, `source_channel`, `user_agent`, `status`, `notification_sent`, `submitted_at`, `updated_at`) VALUES
(1, 'OUT_OF_STATE', 'Orange', NULL, NULL, '250_500', '[\"pdf\"]', NULL, 'Jerry Hernandez', 'gerardoh@gmail.com', '(213) 309-7286', 'C-28', NULL, NULL, 'sms', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1', 'pending', 1, '2026-01-08 13:20:53', '2026-01-08 13:21:00'),
(2, 'EMPTY_NESTER', 'Irvine', NULL, NULL, '100_250', '[\"pdf\"]', NULL, 'Neil Torquato', 'neilt888@gmail.com', '19492780118', 'C-29', NULL, NULL, 'sms', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'pending', 1, '2026-01-08 18:41:15', '2026-01-08 18:41:21'),
(3, 'EMPTY_NESTER', 'Irvine', NULL, NULL, '100_250', '[\"pdf\"]', NULL, 'Neil Torquato', 'neilt888@gmail.com', '19492780118', 'C-29', NULL, NULL, 'sms', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'pending', 1, '2026-01-08 18:41:48', '2026-01-08 18:41:54');

-- --------------------------------------------------------

--
-- Table structure for table `link_templates`
--

CREATE TABLE `link_templates` (
  `id` int(11) NOT NULL,
  `template_name` varchar(100) NOT NULL,
  `template_label` varchar(100) NOT NULL,
  `url_template` varchar(500) NOT NULL,
  `icon` varchar(50) DEFAULT 'link',
  `placeholder_text` varchar(200) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'social',
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `link_templates`
--

INSERT INTO `link_templates` (`id`, `template_name`, `template_label`, `url_template`, `icon`, `placeholder_text`, `category`, `active`, `created_at`) VALUES
(1, 'linkedin', 'LinkedIn', 'https://linkedin.com/in/{username}', '?', 'Enter LinkedIn username', 'social', 1, '2025-09-22 19:53:53'),
(2, 'facebook', 'Facebook', 'https://facebook.com/{username}', '?', 'Enter Facebook username', 'social', 1, '2025-09-22 19:53:53'),
(3, 'instagram', 'Instagram', 'https://instagram.com/{username}', '?', 'Enter Instagram username', 'social', 1, '2025-09-22 19:53:53'),
(4, 'twitter', 'Twitter/X', 'https://twitter.com/{username}', '?', 'Enter Twitter username', 'social', 1, '2025-09-22 19:53:53'),
(5, 'website', 'Website', '{url}', '?', 'Enter full website URL', 'professional', 1, '2025-09-22 19:53:53'),
(6, 'email', 'Email', 'mailto:{email}', '?', 'Enter email address', 'contact', 1, '2025-09-22 19:53:53'),
(7, 'phone', 'Phone', 'tel:{phone}', '?', 'Enter phone number', 'contact', 1, '2025-09-22 19:53:53'),
(8, 'calendar', 'Schedule Meeting', '{url}', '?', 'Enter calendar booking URL', 'professional', 1, '2025-09-22 19:53:53'),
(9, 'portfolio', 'Portfolio', '{url}', '?', 'Enter portfolio URL', 'professional', 1, '2025-09-22 19:53:53'),
(10, 'youtube', 'YouTube', 'https://youtube.com/{username}', '?', 'Enter YouTube channel', 'social', 1, '2025-09-22 19:53:53'),
(11, 'tiktok', 'TikTok', 'https://tiktok.com/@{username}', '?', 'Enter TikTok username', 'social', 1, '2025-09-22 19:53:53'),
(12, 'whatsapp', 'WhatsApp', 'https://wa.me/{phone}', '?', 'Enter phone number', 'contact', 1, '2025-09-22 19:53:53');

-- --------------------------------------------------------

--
-- Table structure for table `market_report_cache`
--

CREATE TABLE `market_report_cache` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `report_type` enum('market','inventory_zip','closings','new_listings','openhouses','price_bands','farm_polygon','analytics') NOT NULL,
  `lookback_days` int(11) NOT NULL,
  `geo_cities` text DEFAULT NULL,
  `geo_zips` text DEFAULT NULL,
  `json_path` varchar(255) DEFAULT NULL,
  `csv_primary_path` varchar(255) DEFAULT NULL,
  `html_path` varchar(255) NOT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `market_report_cache`
--

INSERT INTO `market_report_cache` (`id`, `employee_id`, `report_type`, `lookback_days`, `geo_cities`, `geo_zips`, `json_path`, `csv_primary_path`, `html_path`, `pdf_path`, `generated_at`) VALUES
(1, 0, 'inventory_zip', 30, '', '91750', '/home/pctpanel/private-reports/0/inventory_zip/20251020210431/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251020210431/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251020210431/report.html', NULL, '2025-10-20 21:04:34'),
(2, 0, 'market', 30, '', '91750', '/home/pctpanel/private-reports/0/market/20251020211024/snapshot.json', '/home/pctpanel/private-reports/0/market/20251020211024/by_city.csv', '/home/pctpanel/private-reports/0/market/20251020211024/report.html', NULL, '2025-10-20 21:10:27'),
(3, 0, 'inventory_zip', 30, '', '91750', '/home/pctpanel/private-reports/0/inventory_zip/20251020211051/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251020211051/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251020211051/report.html', NULL, '2025-10-20 21:10:55'),
(4, 0, 'closings', 30, '', '91750', '/home/pctpanel/private-reports/0/closings/20251020211130/closings.json', '/home/pctpanel/private-reports/0/closings/20251020211130/closings.csv', '/home/pctpanel/private-reports/0/closings/20251020211130/report.html', NULL, '2025-10-20 21:11:34'),
(5, 0, 'closings', 30, '', '91750', '/home/pctpanel/private-reports/0/closings/20251020211831/closings.json', '/home/pctpanel/private-reports/0/closings/20251020211831/closings.csv', '/home/pctpanel/private-reports/0/closings/20251020211831/report.html', NULL, '2025-10-20 21:18:35'),
(6, 0, 'closings', 30, '', '91750', '/home/pctpanel/private-reports/0/closings/20251020213058/closings.json', '/home/pctpanel/private-reports/0/closings/20251020213058/closings.csv', '/home/pctpanel/private-reports/0/closings/20251020213058/report.html', NULL, '2025-10-20 21:31:17'),
(7, 0, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/closings/20251020215006/closings.json', '/home/pctpanel/private-reports/0/closings/20251020215006/closings.csv', '/home/pctpanel/private-reports/0/closings/20251020215006/report.html', NULL, '2025-10-20 21:50:28'),
(8, 0, '', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/new_listings/20251020215245/new_listings.json', '/home/pctpanel/private-reports/0/new_listings/20251020215245/new_listings.csv', '/home/pctpanel/private-reports/0/new_listings/20251020215245/report.html', NULL, '2025-10-20 21:52:46'),
(9, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251020215329/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251020215329/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251020215329/report.html', NULL, '2025-10-20 21:53:30'),
(10, 0, '', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/analytics/20251020215437/analytics.json', NULL, '/home/pctpanel/private-reports/0/analytics/20251020215437/report.html', NULL, '2025-10-20 21:54:43'),
(11, 0, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/closings/20251020215537/closings.json', '/home/pctpanel/private-reports/0/closings/20251020215537/closings.csv', '/home/pctpanel/private-reports/0/closings/20251020215537/report.html', NULL, '2025-10-20 21:55:59'),
(12, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251020215736/snapshot.json', '/home/pctpanel/private-reports/0/market/20251020215736/by_city.csv', '/home/pctpanel/private-reports/0/market/20251020215736/report.html', NULL, '2025-10-20 21:57:39'),
(13, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251022174005/snapshot.json', '/home/pctpanel/private-reports/0/market/20251022174005/by_city.csv', '/home/pctpanel/private-reports/0/market/20251022174005/report.html', NULL, '2025-10-22 17:40:08'),
(14, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251022174744/snapshot.json', '/home/pctpanel/private-reports/0/market/20251022174744/by_city.csv', '/home/pctpanel/private-reports/0/market/20251022174744/report.html', NULL, '2025-10-22 17:47:48'),
(15, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022175214/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022175214/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022175214/report.html', NULL, '2025-10-22 17:52:15'),
(16, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022175621/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022175621/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022175621/report.html', NULL, '2025-10-22 17:56:22'),
(17, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022180140/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022180140/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022180140/report.html', NULL, '2025-10-22 18:01:41'),
(18, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022180547/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022180547/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022180547/report.html', NULL, '2025-10-22 18:05:48'),
(19, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022180642/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022180642/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022180642/report.html', NULL, '2025-10-22 18:06:44'),
(20, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022183718/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022183718/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022183718/report.html', NULL, '2025-10-22 18:37:19'),
(21, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022184435/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022184435/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022184435/report.html', NULL, '2025-10-22 18:44:36'),
(22, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022191143/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022191143/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022191143/report.html', NULL, '2025-10-22 19:11:44'),
(23, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022192707/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022192707/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022192707/report.html', NULL, '2025-10-22 19:27:08'),
(24, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022194632/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022194632/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022194632/report.html', NULL, '2025-10-22 19:46:34'),
(25, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022194743/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022194743/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022194743/report.html', NULL, '2025-10-22 19:47:44'),
(26, 0, 'inventory_zip', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022195242/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022195242/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022195242/report.html', NULL, '2025-10-22 19:52:44'),
(27, 0, 'closings', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/closings/20251022195319/closings.json', '/home/pctpanel/private-reports/0/closings/20251022195319/closings.csv', '/home/pctpanel/private-reports/0/closings/20251022195319/report.html', NULL, '2025-10-22 19:53:45'),
(28, 0, 'closings', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/closings/20251022200125/closings.json', '/home/pctpanel/private-reports/0/closings/20251022200125/closings.csv', '/home/pctpanel/private-reports/0/closings/20251022200125/report.html', NULL, '2025-10-22 20:01:48'),
(29, 0, '', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/new_listings/20251022200654/new_listings.json', '/home/pctpanel/private-reports/0/new_listings/20251022200654/new_listings.csv', '/home/pctpanel/private-reports/0/new_listings/20251022200654/report.html', NULL, '2025-10-22 20:06:55'),
(30, 0, 'new_listings', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/new_listings/20251022202204/new_listings.json', '/home/pctpanel/private-reports/0/new_listings/20251022202204/new_listings.csv', '/home/pctpanel/private-reports/0/new_listings/20251022202204/report.html', NULL, '2025-10-22 20:22:05'),
(31, 0, 'new_listings', 30, 'San Dimas', '', '/home/pctpanel/private-reports/0/new_listings/20251022202541/new_listings.json', '/home/pctpanel/private-reports/0/new_listings/20251022202541/new_listings.csv', '/home/pctpanel/private-reports/0/new_listings/20251022202541/report.html', NULL, '2025-10-22 20:25:42'),
(32, 0, 'openhouses', 30, 'la verne', '', '/home/pctpanel/private-reports/0/openhouses/20251022210618/openhouses.json', '/home/pctpanel/private-reports/0/openhouses/20251022210618/openhouses.csv', '/home/pctpanel/private-reports/0/openhouses/20251022210618/report.html', NULL, '2025-10-22 21:06:19'),
(33, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251022224042/inventory_zip.json', '/home/pctpanel/private-reports/0/inventory_zip/20251022224042/inventory_zip.csv', '/home/pctpanel/private-reports/0/inventory_zip/20251022224042/report.html', NULL, '2025-10-22 22:40:43'),
(34, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251022224738/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251022224738/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251022224738/report.html', NULL, '2025-10-22 22:47:40'),
(35, 0, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/closings/20251024174955/closings.json', '/home/pctpanel/private-reports/0/closings/20251024174955/closings.csv', '/home/pctpanel/private-reports/0/closings/20251024174955/report.html', NULL, '2025-10-24 17:50:16'),
(36, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251024175059/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251024175059/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251024175059/report.html', NULL, '2025-10-24 17:51:00'),
(37, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251024175536/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251024175536/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251024175536/report.html', NULL, '2025-10-24 17:55:37'),
(38, 0, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/closings/20251024175618/closings.json', '/home/pctpanel/private-reports/0/closings/20251024175618/closings.csv', '/home/pctpanel/private-reports/0/closings/20251024175618/report.html', NULL, '2025-10-24 17:56:38'),
(39, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024180035/snapshot.json', '/home/pctpanel/private-reports/47/market/20251024180035/by_city.csv', '/home/pctpanel/private-reports/47/market/20251024180035/report.html', NULL, '2025-10-24 18:00:39'),
(40, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251024181101/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251024181101/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251024181101/report.html', NULL, '2025-10-24 18:11:02'),
(41, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251024183229/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251024183229/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251024183229/report.html', NULL, '2025-10-24 18:32:30'),
(42, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251024191453/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251024191453/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251024191453/report.html', NULL, '2025-10-24 19:14:54'),
(43, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251024192427/inventory_zip.json', '/home/pctpanel/private-reports/47/inventory_zip/20251024192427/inventory_zip.csv', '/home/pctpanel/private-reports/47/inventory_zip/20251024192427/report.html', NULL, '2025-10-24 19:24:28'),
(44, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024220945/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024220945/report.html', NULL, '2025-10-24 22:09:48'),
(45, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024221417/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024221417/report.html', NULL, '2025-10-24 22:14:21'),
(46, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024222627/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024222627/report.html', NULL, '2025-10-24 22:26:50'),
(47, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251024223333/snapshot.json', NULL, '/home/pctpanel/private-reports/0/market/20251024223333/report.html', NULL, '2025-10-24 22:33:56'),
(48, 47, 'market', 30, 'Downey', '', '/home/pctpanel/private-reports/47/market/20251024224422/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024224422/report.html', NULL, '2025-10-24 22:44:59'),
(49, 47, 'market', 30, 'Downey', '', '/home/pctpanel/private-reports/47/market/20251024225332/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024225332/report.html', NULL, '2025-10-24 22:54:08'),
(50, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024225759/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024225759/report.html', NULL, '2025-10-24 22:58:23'),
(51, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024231852/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024231852/report.html', NULL, '2025-10-24 23:19:16'),
(52, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024232356/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024232356/report.html', NULL, '2025-10-24 23:24:20'),
(53, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251024232816/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024232816/report.html', NULL, '2025-10-24 23:28:43'),
(54, 47, 'market', 30, 'la verne', '', '/home/pctpanel/private-reports/47/market/20251024232950/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251024232950/report.html', NULL, '2025-10-24 23:30:17'),
(55, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251027163014/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251027163014/report.html', NULL, '2025-10-27 16:30:18'),
(56, 47, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/closings/20251027163321/closings.json', NULL, '/home/pctpanel/private-reports/47/closings/20251027163321/report.html', NULL, '2025-10-27 16:33:46'),
(57, 0, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/inventory_zip/20251027164019/inventory.json', NULL, '/home/pctpanel/private-reports/0/inventory_zip/20251027164019/report.html', NULL, '2025-10-27 16:40:23'),
(58, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251027165230/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251027165230/report.html', NULL, '2025-10-27 16:52:34'),
(59, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027165449/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027165449/report.html', NULL, '2025-10-27 16:55:16'),
(60, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251027170326/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251027170326/report.html', NULL, '2025-10-27 17:03:31'),
(61, 3, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/3/closings/20251027170830/closings.json', NULL, '/home/pctpanel/private-reports/3/closings/20251027170830/report.html', NULL, '2025-10-27 17:08:55'),
(62, 47, 'closings', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/closings/20251027172535/closings.json', NULL, '/home/pctpanel/private-reports/47/closings/20251027172535/report.html', NULL, '2025-10-27 17:26:09'),
(63, 47, 'closings', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/closings/20251027174337/closings.json', NULL, '/home/pctpanel/private-reports/47/closings/20251027174337/report.html', NULL, '2025-10-27 17:44:01'),
(64, 0, 'price_bands', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/price_bands/20251027183344/price_bands.json', '/home/pctpanel/private-reports/0/price_bands/20251027183344/price_bands.csv', '/home/pctpanel/private-reports/0/price_bands/20251027183344/report.html', NULL, '2025-10-27 18:33:45'),
(65, 0, 'price_bands', 30, 'Claremont', '', '/home/pctpanel/private-reports/0/price_bands/20251027183945/price_bands.json', '/home/pctpanel/private-reports/0/price_bands/20251027183945/price_bands.csv', '/home/pctpanel/private-reports/0/price_bands/20251027183945/report.html', NULL, '2025-10-27 18:39:46'),
(66, 47, 'price_bands', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/price_bands/20251027184012/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251027184012/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251027184012/report.html', NULL, '2025-10-27 18:40:13'),
(67, 0, 'price_bands', 30, 'Claremont', '', '/home/pctpanel/private-reports/0/price_bands/20251027190206/price_bands.json', '/home/pctpanel/private-reports/0/price_bands/20251027190206/price_bands.csv', '/home/pctpanel/private-reports/0/price_bands/20251027190206/report.html', NULL, '2025-10-27 19:02:06'),
(68, 47, 'price_bands', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/price_bands/20251027190258/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251027190258/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251027190258/report.html', NULL, '2025-10-27 19:02:58'),
(69, 47, 'price_bands', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/price_bands/20251027191703/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251027191703/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251027191703/report.html', NULL, '2025-10-27 19:17:04'),
(70, 47, 'price_bands', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/price_bands/20251027204518/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251027204518/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251027204518/report.html', NULL, '2025-10-27 20:45:19'),
(71, 47, 'price_bands', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/price_bands/20251027204824/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251027204824/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251027204824/report.html', NULL, '2025-10-27 20:48:25'),
(72, 47, 'price_bands', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/price_bands/20251027204927/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251027204927/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251027204927/report.html', NULL, '2025-10-27 20:49:28'),
(73, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027215452/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027215452/report.html', NULL, '2025-10-27 21:55:11'),
(74, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027220123/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027220123/report.html', NULL, '2025-10-27 22:01:43'),
(75, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251027222359/snapshot.json', NULL, '/home/pctpanel/private-reports/0/market/20251027222359/report.html', NULL, '2025-10-27 22:24:19'),
(76, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251027223023/snapshot.json', NULL, '/home/pctpanel/private-reports/0/market/20251027223023/report.html', NULL, '2025-10-27 22:30:42'),
(77, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027223058/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027223058/report.html', NULL, '2025-10-27 22:31:15'),
(78, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027223133/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027223133/report.html', NULL, '2025-10-27 22:31:46'),
(79, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027223749/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027223749/report.html', NULL, '2025-10-27 22:38:09'),
(80, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027231014/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027231014/report.html', NULL, '2025-10-27 23:10:33'),
(81, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251027231843/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251027231843/report.html', NULL, '2025-10-27 23:19:02'),
(82, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251029170806/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029170806/report.html', NULL, '2025-10-29 17:08:26'),
(83, 47, 'new_listings', 14, 'Claremont', '', '/home/pctpanel/private-reports/47/new_listings/20251029173735/new_listings.json', '/home/pctpanel/private-reports/47/new_listings/20251029173735/new_listings.csv', '/home/pctpanel/private-reports/47/new_listings/20251029173735/report.html', NULL, '2025-10-29 17:37:36'),
(84, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251029174307/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029174307/report.html', NULL, '2025-10-29 17:43:27'),
(85, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251029175113/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029175113/report.html', NULL, '2025-10-29 17:51:32'),
(86, 0, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/0/market/20251029180340/snapshot.json', NULL, '/home/pctpanel/private-reports/0/market/20251029180340/report.html', NULL, '2025-10-29 18:03:59'),
(87, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251029180406/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029180406/report.html', NULL, '2025-10-29 18:04:25'),
(88, 47, 'market', 30, 'CLaremont', '', '/home/pctpanel/private-reports/47/market/20251029182011/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029182011/report.html', NULL, '2025-10-29 18:20:35'),
(89, 47, 'market', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/market/20251029182754/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029182754/report.html', NULL, '2025-10-29 18:28:18'),
(90, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251029184603/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251029184603/report.html', NULL, '2025-10-29 18:46:22'),
(91, 47, 'new_listings', 7, 'La Verne', '', '/home/pctpanel/private-reports/47/new_listings/20251029184629/new_listings.json', '/home/pctpanel/private-reports/47/new_listings/20251029184629/new_listings.csv', '/home/pctpanel/private-reports/47/new_listings/20251029184629/report.html', NULL, '2025-10-29 18:46:30'),
(92, 47, 'new_listings', 7, 'la verne', '', '/home/pctpanel/private-reports/47/new_listings/20251029191011/new_listings.json', '/home/pctpanel/private-reports/47/new_listings/20251029191011/new_listings.csv', '/home/pctpanel/private-reports/47/new_listings/20251029191011/report.html', NULL, '2025-10-29 19:10:12'),
(93, 47, 'new_listings', 7, 'la verne', '', '/home/pctpanel/private-reports/47/new_listings/20251029192203/new_listings.json', '/home/pctpanel/private-reports/47/new_listings/20251029192203/new_listings.csv', '/home/pctpanel/private-reports/47/new_listings/20251029192203/report.html', NULL, '2025-10-29 19:22:04'),
(94, 47, 'new_listings', 7, 'Claremont', '', '/home/pctpanel/private-reports/47/new_listings/20251029192257/new_listings.json', '/home/pctpanel/private-reports/47/new_listings/20251029192257/new_listings.csv', '/home/pctpanel/private-reports/47/new_listings/20251029192257/report.html', NULL, '2025-10-29 19:22:57'),
(95, 47, 'new_listings', 14, 'Claremont', '', '/home/pctpanel/private-reports/47/new_listings/20251029192308/new_listings.json', '/home/pctpanel/private-reports/47/new_listings/20251029192308/new_listings.csv', '/home/pctpanel/private-reports/47/new_listings/20251029192308/report.html', NULL, '2025-10-29 19:23:09'),
(96, 47, 'price_bands', 30, 'claremont', '', '/home/pctpanel/private-reports/47/price_bands/20251029210451/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251029210451/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251029210451/report.html', NULL, '2025-10-29 21:04:52'),
(97, 47, 'price_bands', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/price_bands/20251029211011/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251029211011/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251029211011/report.html', NULL, '2025-10-29 21:10:12'),
(98, 47, 'price_bands', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/price_bands/20251029213628/price_bands.json', '/home/pctpanel/private-reports/47/price_bands/20251029213628/price_bands.csv', '/home/pctpanel/private-reports/47/price_bands/20251029213628/report.html', NULL, '2025-10-29 21:36:29'),
(99, 47, 'inventory_zip', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/inventory_zip/20251029213818/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251029213818/report.html', NULL, '2025-10-29 21:38:22'),
(100, 47, 'inventory_zip', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/inventory_zip/20251029214611/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251029214611/report.html', NULL, '2025-10-29 21:46:16'),
(101, 47, 'inventory_zip', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/inventory_zip/20251029214930/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251029214930/report.html', NULL, '2025-10-29 21:49:35'),
(102, 47, 'inventory_zip', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/inventory_zip/20251029215715/inventory.json', NULL, '/home/pctpanel/private-reports/47/inventory_zip/20251029215715/report.html', NULL, '2025-10-29 21:57:19'),
(103, 47, 'closings', 30, 'Claremont', '', '/home/pctpanel/private-reports/47/closings/20251029222703/closings.json', NULL, '/home/pctpanel/private-reports/47/closings/20251029222703/report.html', NULL, '2025-10-29 22:27:24'),
(104, 50, 'new_listings', 14, 'Riverside', '', '/home/pctpanel/private-reports/50/new_listings/20251031150604/new_listings.json', '/home/pctpanel/private-reports/50/new_listings/20251031150604/new_listings.csv', '/home/pctpanel/private-reports/50/new_listings/20251031150604/report.html', NULL, '2025-10-31 15:06:08'),
(105, 3, 'market', 30, 'Whittier', '', '/home/pctpanel/private-reports/3/market/20251031150656/snapshot.json', NULL, '/home/pctpanel/private-reports/3/market/20251031150656/report.html', NULL, '2025-10-31 15:07:56'),
(106, 22, 'price_bands', 30, 'Northridge', '', '/home/pctpanel/private-reports/22/price_bands/20251031150841/price_bands.json', '/home/pctpanel/private-reports/22/price_bands/20251031150841/price_bands.csv', '/home/pctpanel/private-reports/22/price_bands/20251031150841/report.html', NULL, '2025-10-31 15:08:42'),
(107, 47, 'closings', 30, 'Downey', '', '/home/pctpanel/private-reports/47/closings/20251031154350/closings.json', NULL, '/home/pctpanel/private-reports/47/closings/20251031154350/report.html', NULL, '2025-10-31 15:44:15'),
(108, 47, 'market', 30, 'La Verne', '', '/home/pctpanel/private-reports/47/market/20251103210903/snapshot.json', NULL, '/home/pctpanel/private-reports/47/market/20251103210903/report.html', NULL, '2025-11-03 21:09:23'),
(109, 18, 'market', 30, 'anaheim hills', '', '/home/pctpanel/private-reports/18/market/20251104172248/snapshot.json', NULL, '/home/pctpanel/private-reports/18/market/20251104172248/report.html', NULL, '2025-11-04 17:23:18'),
(110, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201205104/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201205104/report.html', NULL, '2025-12-01 20:52:27'),
(111, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201210429/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201210429/report.html', NULL, '2025-12-01 21:05:52'),
(112, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201211206/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201211206/report.html', NULL, '2025-12-01 21:13:30'),
(113, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201212429/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201212429/report.html', NULL, '2025-12-01 21:25:53'),
(114, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201213914/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201213914/report.html', NULL, '2025-12-01 21:40:39'),
(115, 0, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/0/market/20251201214923/snapshot.json', NULL, '/home/pctpanel/private-reports/0/market/20251201214923/report.html', NULL, '2025-12-01 21:49:59'),
(116, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201215843/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201215843/report.html', NULL, '2025-12-01 21:59:12'),
(117, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201221333/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201221333/report.html', NULL, '2025-12-01 22:14:12'),
(118, 0, 'inventory_zip', 30, 'Irvine', '', '/home/pctpanel/private-reports/0/inventory_zip/20251201221454/inventory.json', NULL, '/home/pctpanel/private-reports/0/inventory_zip/20251201221454/report.html', NULL, '2025-12-01 22:15:01'),
(119, 5, 'market', 30, 'Irvine', '', '/home/pctpanel/private-reports/5/market/20251201221600/snapshot.json', NULL, '/home/pctpanel/private-reports/5/market/20251201221600/report.html', NULL, '2025-12-01 22:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `offices`
--

CREATE TABLE `offices` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(2) DEFAULT NULL,
  `zip` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `region` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `offices`
--

INSERT INTO `offices` (`id`, `name`, `street`, `city`, `state`, `zip`, `phone`, `region`, `created_at`, `updated_at`) VALUES
(1, 'Glendale Office', '516 Burchett St.', 'Glendale', 'CA', '91203', '(818) 543-2130', 'GL', '2025-09-19 18:10:44', '2025-09-19 18:10:44'),
(2, 'Orange County Office', '1111 E. Katella Ave. Ste. 120', 'Orange', 'CA', '92867', '(714) 516-6700', 'OC', '2025-09-19 18:10:44', '2025-09-23 19:45:08'),
(3, 'Inland Empire Branch', '3200 Inland Empire Blvd. Suite #235', 'Ontario', 'CA', '91764', '(951) 528-5915', 'IE', '2025-10-02 05:00:15', '2025-10-02 05:00:15');

-- --------------------------------------------------------

--
-- Table structure for table `simple_links`
--

CREATE TABLE `simple_links` (
  `id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `icon` varchar(50) DEFAULT '?',
  `distribution` enum('global','branch') NOT NULL DEFAULT 'global',
  `branch_id` int(11) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'other',
  `display_order` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `simple_links`
--

INSERT INTO `simple_links` (`id`, `label`, `url`, `icon`, `distribution`, `branch_id`, `category`, `display_order`, `active`, `created_at`, `updated_at`) VALUES
(4, 'PCT WEBSITE', 'https://www.pct.com', '🔗', 'global', NULL, 'other', 0, 1, '2025-10-02 04:19:30', '2025-10-02 04:40:11'),
(5, 'TRAININGS', 'https://mcusercontent.com/3f123598483b787fa180fff0f/files/19d2dfca-90eb-b8c8-5026-e6f1ab5ca369/TrainingMenu.pdf', '📈', 'global', NULL, 'other', 0, 1, '2025-10-02 04:37:57', '2025-10-02 04:39:33'),
(6, 'NETSHEETS', 'https://pacificcoastagent.com/', '🔗', 'global', NULL, 'other', 0, 1, '2025-10-03 22:38:39', '2025-10-06 22:09:49'),
(7, 'PROFILES', 'http://smartdirectre.com/pctpropertypro', '🔗', 'global', NULL, 'other', 0, 1, '2025-10-03 22:41:43', '2025-10-06 22:10:14'),
(9, 'RESALE RATES', 'https://www.pct.com/calculator/', '💻', 'global', NULL, 'other', 6, 1, '2025-10-06 22:13:20', '2025-10-06 22:13:20');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`, `updated_at`, `updated_by`) VALUES
('admin_background_image', 'assets/images/backgrounds/admin_bg_1758580070.jpg', NULL, '2025-09-22 22:27:50', NULL),
('allowed_image_types', 'image/jpeg,image/png,image/gif,image/webp', 'Allowed image MIME types for uploads', '2025-09-19 18:10:44', NULL),
('analytics_enabled', 'true', 'Enable analytics tracking', '2025-09-19 18:10:44', NULL),
('default_background', 'site-bg.jpg', 'Default background image for VCards', '2025-09-19 18:10:44', NULL),
('header_background', '#00263d', NULL, '2025-09-23 20:48:29', 'admin'),
('max_upload_size', '5242880', 'Maximum file upload size in bytes (5MB)', '2025-09-19 18:10:44', NULL),
('site_background', 'url(/vcard-new/assets/images/backgrounds/site_bg_1758651015.jpg)', NULL, '2025-09-23 18:10:15', 'admin'),
('site_name', 'Pacific Coast Title Company', 'Company name displayed in VCards', '2025-09-19 18:10:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vcard_links`
--

CREATE TABLE `vcard_links` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `url_template` varchar(255) DEFAULT NULL,
  `placeholder` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'social',
  `active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `requires_https` tinyint(1) DEFAULT 0,
  `validation_pattern` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `distribution_level` enum('global','branch','employee') DEFAULT 'employee',
  `auto_assign` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_activity`
--
ALTER TABLE `admin_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_activity_user` (`admin_user_id`),
  ADD KEY `idx_admin_activity_action` (`action`),
  ADD KEY `idx_admin_activity_created` (`created_at`);

--
-- Indexes for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_admin_sessions_token` (`session_token`),
  ADD KEY `idx_admin_sessions_expires` (`expires_at`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_admin_users_username` (`username`),
  ADD KEY `idx_admin_users_email` (`email`),
  ADD KEY `idx_admin_users_role` (`role`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_employees_slug` (`slug`),
  ADD KEY `idx_employees_active` (`active`),
  ADD KEY `idx_employees_department` (`department_id`),
  ADD KEY `idx_employees_office` (`office_id`),
  ADD KEY `idx_employees_email` (`email`),
  ADD KEY `idx_employees_website_active` (`website_active`);

--
-- Indexes for table `employee_activity`
--
ALTER TABLE `employee_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_activity_employee_id` (`employee_id`),
  ADD KEY `idx_employee_activity_type` (`activity_type`),
  ADD KEY `idx_employee_activity_created_at` (`created_at`);

--
-- Indexes for table `employee_links`
--
ALTER TABLE `employee_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `farm_requests`
--
ALTER TABLE `farm_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_rep_id` (`rep_id`),
  ADD KEY `idx_submitted_at` (`submitted_at`);

--
-- Indexes for table `link_templates`
--
ALTER TABLE `link_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_template_name` (`template_name`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`active`);

--
-- Indexes for table `market_report_cache`
--
ALTER TABLE `market_report_cache`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_emp_type` (`employee_id`,`report_type`,`lookback_days`);

--
-- Indexes for table `offices`
--
ALTER TABLE `offices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `simple_links`
--
ALTER TABLE `simple_links`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `vcard_links`
--
ALTER TABLE `vcard_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_activity`
--
ALTER TABLE `admin_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=233;

--
-- AUTO_INCREMENT for table `admin_sessions`
--
ALTER TABLE `admin_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=170;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `employee_activity`
--
ALTER TABLE `employee_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1003;

--
-- AUTO_INCREMENT for table `employee_links`
--
ALTER TABLE `employee_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `farm_requests`
--
ALTER TABLE `farm_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `link_templates`
--
ALTER TABLE `link_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `market_report_cache`
--
ALTER TABLE `market_report_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `offices`
--
ALTER TABLE `offices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `simple_links`
--
ALTER TABLE `simple_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `vcard_links`
--
ALTER TABLE `vcard_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`);

--
-- Constraints for table `employee_activity`
--
ALTER TABLE `employee_activity`
  ADD CONSTRAINT `employee_activity_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
