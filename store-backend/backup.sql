/*!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.18-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: store
-- ------------------------------------------------------
-- Server version	10.6.18-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Approvement`
--

DROP TABLE IF EXISTS `Approvement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Approvement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prepared_by_id` int(11) DEFAULT NULL,
  `checked_by_id` int(11) DEFAULT NULL,
  `received_by_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Approvement_prepared_by_id_fkey` (`prepared_by_id`),
  KEY `Approvement_checked_by_id_fkey` (`checked_by_id`),
  KEY `Approvement_received_by_id_fkey` (`received_by_id`),
  CONSTRAINT `Approvement_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `Employee` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Approvement_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `Employee` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Approvement_received_by_id_fkey` FOREIGN KEY (`received_by_id`) REFERENCES `Employee` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Approvement`
--

LOCK TABLES `Approvement` WRITE;
/*!40000 ALTER TABLE `Approvement` DISABLE KEYS */;
INSERT INTO `Approvement` VALUES (1,1,NULL,NULL);
/*!40000 ALTER TABLE `Approvement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Department`
--

DROP TABLE IF EXISTS `Department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_name` varchar(191) NOT NULL,
  `department_head_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_department_head_id_key` (`department_head_id`),
  CONSTRAINT `Department_department_head_id_fkey` FOREIGN KEY (`department_head_id`) REFERENCES `Employee` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Department`
--

LOCK TABLES `Department` WRITE;
/*!40000 ALTER TABLE `Department` DISABLE KEYS */;
INSERT INTO `Department` VALUES (1,'IT Department',NULL),(2,'Clame Department',NULL),(3,'HR Department',NULL),(4,'Enginering Department',NULL),(5,'Store Department',NULL);
/*!40000 ALTER TABLE `Department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Employee`
--

DROP TABLE IF EXISTS `Employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(50) NOT NULL,
  `department_id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_email_key` (`email`),
  UNIQUE KEY `Employee_phone_key` (`phone`),
  KEY `Employee_role_id_fkey` (`role_id`),
  KEY `Employee_department_id_fkey` (`department_id`),
  CONSTRAINT `Employee_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Employee_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Employee`
--

LOCK TABLES `Employee` WRITE;
/*!40000 ALTER TABLE `Employee` DISABLE KEYS */;
INSERT INTO `Employee` VALUES (1,'Kasahun ybeltal',1,'john.doe@example.com','0945678900','$2b$10$9u9r5kEW0v63slT9ai23L.zXZ2S/njOURS3VHCqYXuqhtNj1GskUG',4),(2,'Abebe ybeltal',4,'john.doe21@example.com','0943678900','$2b$10$yckaqCs1q7eRxX1HSJVrt.31ZXiynFYzcXViGqnOsIRclnS.0l1ty',5);
/*!40000 ALTER TABLE `Employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Grn`
--

DROP TABLE IF EXISTS `Grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Grn` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `supplier` varchar(191) NOT NULL,
  `suppliers_inv_other_no` varchar(191) NOT NULL,
  `store_location` varchar(191) NOT NULL,
  `purchase_req_num` int(11) NOT NULL,
  `purchase_order_num` int(11) NOT NULL,
  `approvment_id` int(11) DEFAULT NULL,
  `total_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Grn_total_id_key` (`total_id`),
  KEY `Grn_approvment_id_fkey` (`approvment_id`),
  CONSTRAINT `Grn_approvment_id_fkey` FOREIGN KEY (`approvment_id`) REFERENCES `Approvement` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Grn_total_id_fkey` FOREIGN KEY (`total_id`) REFERENCES `Total` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Grn`
--

LOCK TABLES `Grn` WRITE;
/*!40000 ALTER TABLE `Grn` DISABLE KEYS */;
INSERT INTO `Grn` VALUES (1,'2023-10-01','ABC Suppliers','INV12345','Warehouse A',1001,2001,1,1);
/*!40000 ALTER TABLE `Grn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `GrnItem`
--

DROP TABLE IF EXISTS `GrnItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GrnItem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grn_id` int(11) NOT NULL,
  `ser_no` int(11) NOT NULL,
  `description` int(11) NOT NULL,
  `unit_measurement_id` int(11) NOT NULL,
  `qua_ordered` int(11) NOT NULL,
  `qua_delivered` int(11) NOT NULL,
  `quantity_received` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `total_item_price` double NOT NULL,
  `remark` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `GrnItem_unit_measurement_id_fkey` (`unit_measurement_id`),
  KEY `GrnItem_grn_id_fkey` (`grn_id`),
  KEY `GrnItem_description_fkey` (`description`),
  CONSTRAINT `GrnItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `GrnItem_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `Grn` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `GrnItem_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GrnItem`
--

LOCK TABLES `GrnItem` WRITE;
/*!40000 ALTER TABLE `GrnItem` DISABLE KEYS */;
INSERT INTO `GrnItem` VALUES (1,1,1,1,1,50,45,45,20.5,922.5,'Received in good condition');
/*!40000 ALTER TABLE `GrnItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Item`
--

DROP TABLE IF EXISTS `Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `unit_measurement_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Item_name_key` (`name`),
  KEY `Item_unit_measurement_id_fkey` (`unit_measurement_id`),
  KEY `Item_type_id_fkey` (`type_id`),
  CONSTRAINT `Item_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `ItemType` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Item_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Item`
--

LOCK TABLES `Item` WRITE;
/*!40000 ALTER TABLE `Item` DISABLE KEYS */;
INSERT INTO `Item` VALUES (1,'fix',1,1),(2,'Labtop',1,1);
/*!40000 ALTER TABLE `Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ItemType`
--

DROP TABLE IF EXISTS `ItemType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ItemType` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ItemType_type_key` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ItemType`
--

LOCK TABLES `ItemType` WRITE;
/*!40000 ALTER TABLE `ItemType` DISABLE KEYS */;
INSERT INTO `ItemType` VALUES (2,'Labtop'),(1,'Pen');
/*!40000 ALTER TABLE `ItemType` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `employee_id` int(11) NOT NULL,
  `grn_id` int(11) DEFAULT NULL,
  `srn_id` int(11) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Notification_grn_id_fkey` (`grn_id`),
  KEY `Notification_srn_id_fkey` (`srn_id`),
  KEY `Notification_employee_id_fkey` (`employee_id`),
  CONSTRAINT `Notification_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `Employee` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Notification_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `Grn` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Notification_srn_id_fkey` FOREIGN KEY (`srn_id`) REFERENCES `Srn` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ReferanceScc`
--

DROP TABLE IF EXISTS `ReferanceScc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ReferanceScc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scc_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `grn_id` int(11) DEFAULT NULL,
  `iv_id` int(11) DEFAULT NULL,
  `unit_measurement_id` int(11) NOT NULL,
  `stock_in_key` int(11) DEFAULT NULL,
  `stock_out_key` int(11) DEFAULT NULL,
  `stock_balance_key` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ReferanceScc_unit_measurement_id_fkey` (`unit_measurement_id`),
  KEY `ReferanceScc_scc_id_fkey` (`scc_id`),
  KEY `ReferanceScc_grn_id_fkey` (`grn_id`),
  KEY `ReferanceScc_iv_id_fkey` (`iv_id`),
  CONSTRAINT `ReferanceScc_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `Grn` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ReferanceScc_iv_id_fkey` FOREIGN KEY (`iv_id`) REFERENCES `Siv` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ReferanceScc_scc_id_fkey` FOREIGN KEY (`scc_id`) REFERENCES `Scc` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ReferanceScc_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ReferanceScc`
--

LOCK TABLES `ReferanceScc` WRITE;
/*!40000 ALTER TABLE `ReferanceScc` DISABLE KEYS */;
INSERT INTO `ReferanceScc` VALUES (1,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(2,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(3,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(4,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(5,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(6,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(7,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(8,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(9,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(10,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(11,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL),(12,1,'2025-03-27',1,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `ReferanceScc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_role_key` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
INSERT INTO `Role` VALUES (2,'admin'),(3,'employee'),(6,'stock-admin'),(4,'stock-kepper'),(5,'stock-manager');
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Scc`
--

DROP TABLE IF EXISTS `Scc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Scc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item` varchar(191) NOT NULL,
  `location_shelves_no` varchar(191) NOT NULL,
  `max_stock_level` int(11) NOT NULL,
  `min_stock_level` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Scc_item_key` (`item`),
  CONSTRAINT `Scc_item_fkey` FOREIGN KEY (`item`) REFERENCES `Item` (`name`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Scc`
--

LOCK TABLES `Scc` WRITE;
/*!40000 ALTER TABLE `Scc` DISABLE KEYS */;
INSERT INTO `Scc` VALUES (1,'fix','Shelf 1',100,10);
/*!40000 ALTER TABLE `Scc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Siv`
--

DROP TABLE IF EXISTS `Siv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Siv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `issued_to` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `store_req_num` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Siv`
--

LOCK TABLES `Siv` WRITE;
/*!40000 ALTER TABLE `Siv` DISABLE KEYS */;
/*!40000 ALTER TABLE `Siv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SivItem`
--

DROP TABLE IF EXISTS `SivItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SivItem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `siv_id` int(11) NOT NULL,
  `ser_num` int(11) NOT NULL,
  `description` varchar(191) NOT NULL,
  `um` int(11) NOT NULL,
  `requested` int(11) NOT NULL,
  `issued` int(11) NOT NULL,
  `outstock` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `total_price` double NOT NULL,
  `remark` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SivItem_siv_id_fkey` (`siv_id`),
  KEY `SivItem_description_fkey` (`description`),
  CONSTRAINT `SivItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item` (`name`) ON UPDATE CASCADE,
  CONSTRAINT `SivItem_siv_id_fkey` FOREIGN KEY (`siv_id`) REFERENCES `Siv` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SivItem`
--

LOCK TABLES `SivItem` WRITE;
/*!40000 ALTER TABLE `SivItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `SivItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Srn`
--

DROP TABLE IF EXISTS `Srn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Srn` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requisition_work_unit` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `approvment_id` int(11) DEFAULT NULL,
  `total_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Srn_total_id_key` (`total_id`),
  KEY `Srn_approvment_id_fkey` (`approvment_id`),
  CONSTRAINT `Srn_approvment_id_fkey` FOREIGN KEY (`approvment_id`) REFERENCES `Approvement` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Srn_total_id_fkey` FOREIGN KEY (`total_id`) REFERENCES `Total` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Srn`
--

LOCK TABLES `Srn` WRITE;
/*!40000 ALTER TABLE `Srn` DISABLE KEYS */;
INSERT INTO `Srn` VALUES (1,'Unit A','2023-10-01',NULL,NULL);
/*!40000 ALTER TABLE `Srn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SrnItem`
--

DROP TABLE IF EXISTS `SrnItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SrnItem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `srn_id` int(11) NOT NULL,
  `serial_num` int(11) NOT NULL,
  `description` varchar(191) NOT NULL,
  `unit_measurement_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `remarks` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SrnItem_unit_measurement_id_fkey` (`unit_measurement_id`),
  KEY `SrnItem_srn_id_fkey` (`srn_id`),
  CONSTRAINT `SrnItem_srn_id_fkey` FOREIGN KEY (`srn_id`) REFERENCES `Srn` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SrnItem_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SrnItem`
--

LOCK TABLES `SrnItem` WRITE;
/*!40000 ALTER TABLE `SrnItem` DISABLE KEYS */;
INSERT INTO `SrnItem` VALUES (1,1,101,'1',2,50,'In good condition');
/*!40000 ALTER TABLE `SrnItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StockBalance`
--

DROP TABLE IF EXISTS `StockBalance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StockBalance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `total_price` double NOT NULL,
  `ref_key` int(11) NOT NULL,
  `last_stock_balance` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `StockBalance_ref_key_fkey` (`ref_key`),
  CONSTRAINT `StockBalance_ref_key_fkey` FOREIGN KEY (`ref_key`) REFERENCES `ReferanceScc` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StockBalance`
--

LOCK TABLES `StockBalance` WRITE;
/*!40000 ALTER TABLE `StockBalance` DISABLE KEYS */;
INSERT INTO `StockBalance` VALUES (1,45,20.5,922.5,3,0),(2,90,20.5,922.5,4,0),(3,135,20.5,922.5,5,0),(4,180,20.5,922.5,6,0),(5,225,20.5,922.5,7,0),(6,270,20.5,922.5,8,0),(7,315,20.5,922.5,9,0),(8,360,20.5,922.5,10,0),(9,405,20.5,922.5,11,0),(10,450,20.5,922.5,12,1);
/*!40000 ALTER TABLE `StockBalance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StockIn`
--

DROP TABLE IF EXISTS `StockIn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StockIn` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  `ref_key` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `total_price` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StockIn_ref_key_key` (`ref_key`),
  CONSTRAINT `StockIn_ref_key_fkey` FOREIGN KEY (`ref_key`) REFERENCES `ReferanceScc` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StockIn`
--

LOCK TABLES `StockIn` WRITE;
/*!40000 ALTER TABLE `StockIn` DISABLE KEYS */;
INSERT INTO `StockIn` VALUES (1,45,3,20.5,922.5),(2,45,4,20.5,922.5),(3,45,5,20.5,922.5),(4,45,6,20.5,922.5),(5,45,7,20.5,922.5),(6,45,8,20.5,922.5),(7,45,9,20.5,922.5),(8,45,10,20.5,922.5),(9,45,11,20.5,922.5),(10,45,12,20.5,922.5);
/*!40000 ALTER TABLE `StockIn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StockOut`
--

DROP TABLE IF EXISTS `StockOut`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StockOut` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `total_price` double NOT NULL,
  `ref_key` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `StockOut_ref_key_fkey` (`ref_key`),
  CONSTRAINT `StockOut_ref_key_fkey` FOREIGN KEY (`ref_key`) REFERENCES `ReferanceScc` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StockOut`
--

LOCK TABLES `StockOut` WRITE;
/*!40000 ALTER TABLE `StockOut` DISABLE KEYS */;
/*!40000 ALTER TABLE `StockOut` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StoreIssueVoucher`
--

DROP TABLE IF EXISTS `StoreIssueVoucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StoreIssueVoucher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `issued_to` varchar(191) NOT NULL,
  `store_req_no` int(11) NOT NULL,
  `total_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StoreIssueVoucher_total_id_key` (`total_id`),
  CONSTRAINT `StoreIssueVoucher_total_id_fkey` FOREIGN KEY (`total_id`) REFERENCES `Total` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StoreIssueVoucher`
--

LOCK TABLES `StoreIssueVoucher` WRITE;
/*!40000 ALTER TABLE `StoreIssueVoucher` DISABLE KEYS */;
INSERT INTO `StoreIssueVoucher` VALUES (2,'John Doe',1,NULL,'2024-03-10');
/*!40000 ALTER TABLE `StoreIssueVoucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StoreIssueVoucherItem`
--

DROP TABLE IF EXISTS `StoreIssueVoucherItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StoreIssueVoucherItem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description_id` int(11) NOT NULL,
  `unit_measurement_id` int(11) NOT NULL,
  `requested` int(11) NOT NULL,
  `issued` int(11) NOT NULL,
  `out_of_stock` int(11) NOT NULL,
  `unit_price` double NOT NULL,
  `total_price` double NOT NULL,
  `remark` varchar(191) NOT NULL,
  `store_issue_key` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `StoreIssueVoucherItem_description_id_fkey` (`description_id`),
  KEY `StoreIssueVoucherItem_unit_measurement_id_fkey` (`unit_measurement_id`),
  KEY `StoreIssueVoucherItem_store_issue_key_fkey` (`store_issue_key`),
  CONSTRAINT `StoreIssueVoucherItem_description_id_fkey` FOREIGN KEY (`description_id`) REFERENCES `Item` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `StoreIssueVoucherItem_store_issue_key_fkey` FOREIGN KEY (`store_issue_key`) REFERENCES `StoreIssueVoucher` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `StoreIssueVoucherItem_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StoreIssueVoucherItem`
--

LOCK TABLES `StoreIssueVoucherItem` WRITE;
/*!40000 ALTER TABLE `StoreIssueVoucherItem` DISABLE KEYS */;
INSERT INTO `StoreIssueVoucherItem` VALUES (3,1,2,10,8,2,50.5,404,'Damaged items replaced',2);
/*!40000 ALTER TABLE `StoreIssueVoucherItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Total`
--

DROP TABLE IF EXISTS `Total`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Total` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total_price` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Total`
--

LOCK TABLES `Total` WRITE;
/*!40000 ALTER TABLE `Total` DISABLE KEYS */;
INSERT INTO `Total` VALUES (1,922.5);
/*!40000 ALTER TABLE `Total` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UnitMeasurement`
--

DROP TABLE IF EXISTS `UnitMeasurement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UnitMeasurement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unit` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UnitMeasurement_unit_key` (`unit`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UnitMeasurement`
--

LOCK TABLES `UnitMeasurement` WRITE;
/*!40000 ALTER TABLE `UnitMeasurement` DISABLE KEYS */;
INSERT INTO `UnitMeasurement` VALUES (1,'Kilogram'),(2,'Pac'),(3,'single');
/*!40000 ALTER TABLE `UnitMeasurement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0e21c713-7bd6-4214-9c5a-dd9097054287','b7428ff0da79b08a06685ebab14a8da3ebd619c2a7c3651a88bf3a71673d528f','2025-03-26 11:37:41.268','20250326113741_init',NULL,NULL,'2025-03-26 11:37:41.254',1),('47dccac7-c166-48c6-bfad-d206cd5bb6b6','75bf09966a4f4d4108bca9e9cd4627d57f410c552f281b3b6cbbced8d2bd0049',NULL,'20250327121702_init','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250327121702_init\n\nDatabase error code: 1452\n\nDatabase error:\nCannot add or update a child row: a foreign key constraint fails (`store`.`#sql-alter-330-28`, CONSTRAINT `SrnItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item` (`name`) ON UPDATE CASCADE)\n\nPlease check the query number 4 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20250327121702_init\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20250327121702_init\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226',NULL,'2025-03-27 12:17:02.778',0),('8a3f0532-4786-4531-a6e5-be850da5c36f','84e6534eb183246bf8fd0c5a4877df5e7d740a70ff39e8de9d34a4b3df795210','2025-03-26 06:13:00.203','20250326061300_init',NULL,NULL,'2025-03-26 06:13:00.167',1),('9d22e80d-86c5-49b5-914a-7ad513e8831f','511c179b96133d59ae3a1b6adba054d59176ea49eff2566565f3ba8dd18b2e58','2025-03-26 06:12:53.237','20250325090159_init',NULL,NULL,'2025-03-26 06:12:49.882',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-27 15:19:19
