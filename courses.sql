-- MySQL dump 10.13  Distrib 8.0.37, for Linux (x86_64)
--
-- Host: localhost    Database: courses
-- ------------------------------------------------------
-- Server version	8.0.37-0ubuntu0.22.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendees`
--

DROP TABLE IF EXISTS `attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendees` (
  `collegeId` text NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `githubName` text NOT NULL,
  `githubToken` text NOT NULL,
  `courseIds` text NOT NULL,
  PRIMARY KEY (`collegeId`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendees`
--

LOCK TABLES `attendees` WRITE;
/*!40000 ALTER TABLE `attendees` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `courseId` text NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `media` blob,
  `start` date DEFAULT NULL,
  `end` date DEFAULT NULL,
  `isActive` text NOT NULL,
  `instructor` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`courseId`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES ('cp0aft385p','Full Stack Web Development','description',NULL,'2024-07-22','2024-07-27','true','Instructor1','2024-07-21 12:52:50');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_drivers`
--

DROP TABLE IF EXISTS `guest_drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_drivers` (
  `driverId` text COLLATE utf8mb4_general_ci NOT NULL,
  `name` text COLLATE utf8mb4_general_ci NOT NULL,
  `phoneNumber` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_drivers`
--

LOCK TABLES `guest_drivers` WRITE;
/*!40000 ALTER TABLE `guest_drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_houses`
--

DROP TABLE IF EXISTS `guest_houses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_houses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8mb4_general_ci NOT NULL,
  `location` text COLLATE utf8mb4_general_ci NOT NULL,
  `rooms` int NOT NULL,
  `available` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_houses`
--

LOCK TABLES `guest_houses` WRITE;
/*!40000 ALTER TABLE `guest_houses` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_houses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_requests`
--

DROP TABLE IF EXISTS `guest_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_requests` (
  `gRequestId` text COLLATE utf8mb4_general_ci NOT NULL,
  `campusId` text COLLATE utf8mb4_general_ci NOT NULL,
  `adminId` text COLLATE utf8mb4_general_ci NOT NULL,
  `requestDate` datetime NOT NULL,
  `requestFrom` datetime NOT NULL,
  `requestTo` datetime NOT NULL,
  `reason` text COLLATE utf8mb4_general_ci NOT NULL,
  `requestStatus` text COLLATE utf8mb4_general_ci NOT NULL,
  `roomId` text COLLATE utf8mb4_general_ci NOT NULL,
  `houseId` text COLLATE utf8mb4_general_ci NOT NULL,
  `approvedBy` text COLLATE utf8mb4_general_ci NOT NULL,
  `approvedOn` datetime NOT NULL,
  `vRequired` text COLLATE utf8mb4_general_ci NOT NULL,
  `vRequestId` int NOT NULL,
  PRIMARY KEY (`gRequestId`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_requests`
--

LOCK TABLES `guest_requests` WRITE;
/*!40000 ALTER TABLE `guest_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_rooms`
--

DROP TABLE IF EXISTS `guest_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_rooms` (
  `roomId` text COLLATE utf8mb4_general_ci NOT NULL,
  `roomNumber` text COLLATE utf8mb4_general_ci NOT NULL,
  `houseId` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` int NOT NULL,
  `vRequestId` text COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_rooms`
--

LOCK TABLES `guest_rooms` WRITE;
/*!40000 ALTER TABLE `guest_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_users`
--

DROP TABLE IF EXISTS `guest_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_users` (
  `collegeId` text NOT NULL,
  `universityId` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `campusId` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `role` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `username` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `course` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `branch` text NOT NULL,
  `year` int NOT NULL,
  `email` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `phoneNumber` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `gender` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `semester` int NOT NULL,
  `mediaCount` int NOT NULL,
  `userImage` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `gcm_regId` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `updatedAt` datetime NOT NULL,
  `section` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `type` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `outingType` text NOT NULL,
  `profileUpdated` int NOT NULL,
  PRIMARY KEY (`collegeId`(15))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_users`
--

LOCK TABLES `guest_users` WRITE;
/*!40000 ALTER TABLE `guest_users` DISABLE KEYS */;
INSERT INTO `guest_users` VALUES ('1201','SVES','SVECW','GuestAdmin','Name','BTECH','IT',0,'-','-','male',0,0,'-','-','2024-03-31 12:33:00','-','-','no',1),('1205','SVES','SVECW','Admin','D.V.N.Nagaraju','BTECH','IT',0,'dvnraju@svecw.edu.in','-','svecw',0,0,'-','-','2016-10-10 01:00:00','-','-','no',1),('3001','SVES','SVECW','SuperAdmin','Dr.J.V.Narasimha Raju','BTECH','ME',0,'jvnraju1978@gmail.com','9441391190','svecw',0,0,'-','-','2016-10-10 01:00:00','-','-','no',1);
/*!40000 ALTER TABLE `guest_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_vehicle_requests`
--

DROP TABLE IF EXISTS `guest_vehicle_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_vehicle_requests` (
  `vRequestId` text COLLATE utf8mb4_general_ci NOT NULL,
  `vehicleId` text COLLATE utf8mb4_general_ci NOT NULL,
  `campusId` text COLLATE utf8mb4_general_ci NOT NULL,
  `adminId` text COLLATE utf8mb4_general_ci NOT NULL,
  `requestDate` date NOT NULL,
  `requestFrom` datetime NOT NULL,
  `requestTo` datetime NOT NULL,
  `placeFrom` text COLLATE utf8mb4_general_ci NOT NULL,
  `placeTo` text COLLATE utf8mb4_general_ci NOT NULL,
  `count` int NOT NULL,
  `reason` text COLLATE utf8mb4_general_ci NOT NULL,
  `requestStatus` text COLLATE utf8mb4_general_ci NOT NULL,
  `driverId` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`vRequestId`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_vehicle_requests`
--

LOCK TABLES `guest_vehicle_requests` WRITE;
/*!40000 ALTER TABLE `guest_vehicle_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_vehicle_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_vehicles`
--

DROP TABLE IF EXISTS `guest_vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_vehicles` (
  `vehicleId` text COLLATE utf8mb4_general_ci NOT NULL,
  `vehicleNumber` text COLLATE utf8mb4_general_ci NOT NULL,
  `name` text COLLATE utf8mb4_general_ci NOT NULL,
  `status` int NOT NULL,
  `vehicleType` text COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_vehicles`
--

LOCK TABLES `guest_vehicles` WRITE;
/*!40000 ALTER TABLE `guest_vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `moduleId` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`moduleId`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module`
--

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES ('mm5t9dwedj','Database Management','-','cp0aft385p','2024-07-27 05:53:00'),('mpu58020kd','NodeJS','description','cp0aft385p','2024-07-21 12:54:19'),('msn9jnxe31','ReactJs','description','cp0aft385p','2024-07-21 12:54:04');
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance`
--

DROP TABLE IF EXISTS `performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentid` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `studentname` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `courseid` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `moduleid` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `topicid` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `score` int DEFAULT NULL,
  PRIMARY KEY (`studentid`,`topicid`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance`
--

LOCK TABLES `performance` WRITE;
/*!40000 ALTER TABLE `performance` DISABLE KEYS */;
INSERT INTO `performance` VALUES (94,'22B01A0511','John','cp0aft385p','1','tkc7uggk1i',0),(95,'22B01A4247','John','cp0aft385p','1','tkc7uggk1i',10),(93,'22B01A4296','John','cp0aft385p','1','tkc7uggk1i',4);
/*!40000 ALTER TABLE `performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text COLLATE utf8mb4_general_ci NOT NULL,
  `option1` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `option2` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `option3` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `option4` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `correctOption` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `topicid` varchar(11) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'What is a React component?','a,A reusable piece of code that represents part of a user interface.','b,A special type of JavaScript function that returns HTML.','c,A styling framework for React applications.','d,A method to handle HTTP requests in React.','a','tkc7uggk1i'),(2,'How do you pass props to a component?','a,By using the useState hook','b,By directly modifying the child component\'s state','c,By passing them as attributes to the component','d,By using the useEffect hook','c','tkc7uggk1i'),(3,'How do you handle events in React?','a,By writing event handlers in HTML attributes','b,By passing a string as an event handler','c,By passing a function as an event handler','d,By using inline JavaScript within JSX','c','tkc7uggk1i'),(4,'What are the two types of React components?','a,Functional and Logical components','b, Functional and Class components','c,Static and Dynamic components','d,Stateless and Stateful components','b','tkc7uggk1i'),(5,'How do you define a functional component in React?','a,Using the function keyword','b, Using the class keyword','c,Using the component keyword','d,Using the const keyword','a','tkc7uggk1i'),(6,'What are props in React?','a,Methods to manage component state','b,Properties used to pass data from parent to child components','c,Functions to handle user interactions','d,HTML attributes used in React components','b','tkc7uggk1i'),(7,'How do you access props in a functional component?','a,Using this.props','b,Using props passed as an argument','c,Using the useProps hook','d,Using context.props','b','tkc7uggk1i'),(8,'How do you pass arguments to event handlers in React?','a,By using bind','b,By passing them as props','c, By directly modifying the state','d,By using an arrow function','d','tkc7uggk1i'),(9,'What is the purpose of the render method in a class component?','a,To define the styles of the component','b, To return the JSX that defines the component\'s UI','c,To initialize state','d,To handle component lifecycle events','b','tkc7uggk1i'),(10,'What is event delegation in React?','a,Attaching multiple event listeners to a single element','b, Attaching a single event listener to a parent element to manage events for child elements','c,Using third-party libraries to handle events','d, Attaching events directly to HTML elements','b','tkc7uggk1i');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studenttopic`
--

DROP TABLE IF EXISTS `studenttopic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studenttopic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `collegeId` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `topicId` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `confidence` int NOT NULL,
  `implementation` text NOT NULL,
  `understand` text NOT NULL,
  PRIMARY KEY (`collegeId`,`topicId`) USING BTREE,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studenttopic`
--

LOCK TABLES `studenttopic` WRITE;
/*!40000 ALTER TABLE `studenttopic` DISABLE KEYS */;
INSERT INTO `studenttopic` VALUES (16,'21B01A12C7','tyizcrtrff',5,'true','yes'),(208,'22B01A0511','tkc7uggk1i',4,'true','yes'),(38,'22B01A0546','tyizcrtrff',4,'true','yes'),(12,'22B01A0580','tkc7uggk1i',5,'true','yes'),(99,'22B01A1210','tkc7uggk1i',4,'true','yes'),(44,'22B01A1230','t2l4smrjzn',5,'true','may-be'),(78,'22B01A1230','thodizw3jx',4,'true','yes'),(62,'22B01A1231','thodizw3jx',5,'true','yes'),(4,'22B01A1231','tkc7uggk1i',3,'true','yes'),(42,'22B01A1232','t2l4smrjzn',4,'true','yes'),(61,'22B01A1239','thodizw3jx',5,'true','yes'),(47,'22B01A1239','tkc7uggk1i',3,'true','yes'),(177,'22B01A1250','tkc7uggk1i',4,'true','yes'),(187,'22B01A1250','tyizcrtrff',4,'true','yes'),(82,'22B01A1256','tkc7uggk1i',4,'true','yes'),(170,'22B01A1280','tkc7uggk1i',4,'true','yes'),(76,'22B01A12A0','thodizw3jx',4,'true','yes'),(2,'22B01A12A0','tkc7uggk1i',5,'true','yes'),(50,'22B01A12B3','tkc7uggk1i',5,'true','yes'),(45,'22B01A12B3','tyizcrtrff',5,'true','yes'),(152,'22B01A12D2','tkc7uggk1i',5,'true','yes'),(149,'22B01A12D4','t2l4smrjzn',4,'true','yes'),(123,'22B01A12D4','tkc7uggk1i',4,'true','yes'),(125,'22B01A12D4','tyizcrtrff',4,'true','yes'),(144,'22B01A12E2','tkc7uggk1i',5,'true','yes'),(145,'22B01A12E2','tyizcrtrff',4,'true','yes'),(130,'22B01A12G3','tkc7uggk1i',4,'true','yes'),(127,'22B01A12I4','t2l4smrjzn',5,'true','yes'),(132,'22B01A12I4','t4ld9q3ifq',4,'true','yes'),(129,'22B01A12I4','thodizw3jx',5,'true','yes'),(85,'22B01A12I4','tkc7uggk1i',5,'true','yes'),(131,'22B01A12I4','trt7c92uox',5,'true','yes'),(126,'22B01A12I4','tyizcrtrff',5,'true','yes'),(139,'22B01A4221','tkc7uggk1i',5,'true','yes'),(155,'22B01A4227','t2l4smrjzn',5,'true','yes'),(158,'22B01A4227','t4ld9q3ifq',5,'true','yes'),(156,'22B01A4227','thodizw3jx',5,'true','yes'),(151,'22B01A4227','tkc7uggk1i',5,'true','yes'),(157,'22B01A4227','trt7c92uox',5,'true','yes'),(153,'22B01A4227','tyizcrtrff',5,'true','yes'),(110,'22B01A4262','t2l4smrjzn',5,'true','yes'),(111,'22B01A4262','thodizw3jx',5,'true','yes'),(87,'22B01A4262','tkc7uggk1i',5,'true','yes'),(109,'22B01A4262','tyizcrtrff',5,'true','yes'),(121,'22B01A4264','t2l4smrjzn',4,'true','may-be'),(167,'22B01A4264','thodizw3jx',4,'true','yes'),(1,'22B01A4264','tkc7uggk1i',4,'true','yes'),(186,'22B01A4264','trt7c92uox',4,'true','yes'),(113,'22B01A4264','tyizcrtrff',4,'true','yes'),(134,'22B01A4265','t2l4smrjzn',4,'true','yes'),(135,'22B01A4265','thodizw3jx',4,'true','yes'),(137,'22B01A4265','trt7c92uox',4,'true','yes'),(133,'22B01A4265','tyizcrtrff',4,'true','yes'),(33,'22B01A4274','t2l4smrjzn',5,'true','yes'),(120,'22B01A4274','t4ld9q3ifq',4,'true','yes'),(34,'22B01A4274','thodizw3jx',4,'true','yes'),(11,'22B01A4274','tkc7uggk1i',5,'true','yes'),(118,'22B01A4274','trt7c92uox',4,'true','yes'),(31,'22B01A4274','tyizcrtrff',5,'true','yes'),(29,'22B01A4275','tkc7uggk1i',4,'true','yes'),(56,'22B01A4275','tyizcrtrff',4,'true','yes'),(104,'22B01A4276','tkc7uggk1i',4,'true','yes'),(72,'22B01A4281','t2l4smrjzn',5,'true','yes'),(73,'22B01A4281','thodizw3jx',4,'true','yes'),(71,'22B01A4281','tyizcrtrff',4,'true','yes'),(95,'22B01A4288','tkc7uggk1i',5,'true','yes'),(138,'22B01A4296','tkc7uggk1i',4,'true','yes'),(140,'22B01A42A1','t4ld9q3ifq',5,'true','yes'),(15,'22B01A42A1','tkc7uggk1i',4,'true','yes'),(107,'22B01A42A1','trt7c92uox',4,'true','yes'),(114,'22B01A42A5','tkc7uggk1i',5,'true','yes'),(179,'22B01A42A7','tkc7uggk1i',4,'true','yes'),(106,'22B01A42A9','t2l4smrjzn',5,'true','yes'),(161,'22B01A42A9','t4ld9q3ifq',5,'true','yes'),(143,'22B01A42A9','thodizw3jx',4,'true','yes'),(86,'22B01A42A9','tkc7uggk1i',5,'true','yes'),(159,'22B01A42A9','trt7c92uox',4,'true','yes'),(105,'22B01A42A9','tyizcrtrff',5,'true','yes'),(98,'22B01A42B0','tkc7uggk1i',5,'true','yes'),(154,'22B01A42B0','tyizcrtrff',4,'true','yes'),(141,'22B01A42B4','t4ld9q3ifq',5,'true','yes'),(74,'22B01A42B7','t2l4smrjzn',5,'true','yes'),(112,'22B01A42B7','thodizw3jx',4,'true','yes'),(54,'22B01A42B7','tyizcrtrff',4,'true','yes'),(55,'22B01A4514','t2l4smrjzn',5,'true','yes'),(195,'22B01A4514','t4ld9q3ifq',5,'true','yes'),(178,'22B01A4514','thodizw3jx',5,'true','yes'),(46,'22B01A4514','tkc7uggk1i',5,'true','yes'),(194,'22B01A4514','trt7c92uox',5,'true','yes'),(59,'22B01A4514','tyizcrtrff',5,'true','yes'),(67,'22B01A4518','t2l4smrjzn',4,'true','yes'),(66,'22B01A4518','thodizw3jx',4,'true','yes'),(24,'22B01A4518','tkc7uggk1i',5,'true','yes'),(183,'22B01A4518','trt7c92uox',4,'true','yes'),(32,'22B01A4561','t2l4smrjzn',4,'true','yes'),(200,'22B01A4561','t4ld9q3ifq',4,'true','yes'),(35,'22B01A4561','thodizw3jx',4,'true','yes'),(13,'22B01A4561','tkc7uggk1i',4,'true','yes'),(190,'22B01A4561','trt7c92uox',4,'true','yes'),(30,'22B01A4561','tyizcrtrff',4,'true','yes'),(36,'22B01A4575','thodizw3jx',5,'true','yes'),(19,'22B01A4575','tkc7uggk1i',5,'true','yes'),(147,'22B01A4579','t2l4smrjzn',5,'true','yes'),(150,'22B01A4579','t4ld9q3ifq',5,'true','yes'),(148,'22B01A4579','thodizw3jx',5,'true','yes'),(79,'22B01A4579','tkc7uggk1i',5,'true','yes'),(146,'22B01A4579','tyizcrtrff',5,'true','yes'),(176,'22B01A4581','t4ld9q3ifq',4,'true','yes'),(27,'22B01A4581','tkc7uggk1i',4,'true','yes'),(169,'22B01A4581','tyizcrtrff',4,'true','yes'),(181,'22B01A4583','t4ld9q3ifq',4,'true','yes'),(37,'22B01A4594','thodizw3jx',4,'true','yes'),(26,'22B01A4594','tkc7uggk1i',4,'true','yes'),(94,'22B01A45A5','t2l4smrjzn',3,'true','yes'),(168,'22B01A45A5','t4ld9q3ifq',2,'true','yes'),(23,'22B01A45A5','tkc7uggk1i',3,'true','yes'),(89,'22B01A45A5','tyizcrtrff',3,'true','yes'),(93,'22B01A4607','tkc7uggk1i',4,'true','yes'),(80,'22B01A4634','tkc7uggk1i',5,'true','yes'),(81,'22B01A4643','tkc7uggk1i',4,'true','yes'),(83,'22B01A4644','tkc7uggk1i',4,'true','yes'),(96,'22B01A4646','tkc7uggk1i',5,'true','yes'),(75,'23B05A1207','tkc7uggk1i',4,'true','yes'),(90,'null','tkc7uggk1i',4,'true','yes');
/*!40000 ALTER TABLE `studenttopic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temple_contact_us`
--

DROP TABLE IF EXISTS `temple_contact_us`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temple_contact_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temple_contact_us`
--

LOCK TABLES `temple_contact_us` WRITE;
/*!40000 ALTER TABLE `temple_contact_us` DISABLE KEYS */;
/*!40000 ALTER TABLE `temple_contact_us` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temple_events`
--

DROP TABLE IF EXISTS `temple_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temple_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `temple_id` int NOT NULL,
  `event_date` date NOT NULL,
  `to_date` date NOT NULL,
  `event_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `event_days` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temple_events`
--

LOCK TABLES `temple_events` WRITE;
/*!40000 ALTER TABLE `temple_events` DISABLE KEYS */;
INSERT INTO `temple_events` VALUES (1,1,'2024-07-03','2024-07-03','vratham',1);
/*!40000 ALTER TABLE `temple_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temple_temples`
--

DROP TABLE IF EXISTS `temple_temples`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temple_temples` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temple_temples`
--

LOCK TABLES `temple_temples` WRITE;
/*!40000 ALTER TABLE `temple_temples` DISABLE KEYS */;
INSERT INTO `temple_temples` VALUES (1,'temple1','tirupathi'),(2,'temple2','varanashi'),(3,'temple3','telengana\r\n');
/*!40000 ALTER TABLE `temple_temples` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topic`
--

DROP TABLE IF EXISTS `topic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topic` (
  `topicId` text COLLATE utf8mb4_general_ci NOT NULL,
  `name` text COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `courseId` text COLLATE utf8mb4_general_ci NOT NULL,
  `moduleId` text COLLATE utf8mb4_general_ci NOT NULL,
  `links` text COLLATE utf8mb4_general_ci NOT NULL,
  `completed` text COLLATE utf8mb4_general_ci NOT NULL,
  `token` text COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `enableQuiz` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`topicId`(10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic`
--

LOCK TABLES `topic` WRITE;
/*!40000 ALTER TABLE `topic` DISABLE KEYS */;
INSERT INTO `topic` VALUES ('t2l4smrjzn','Components, Props, Events','1.Functional vs Class Components\r\n2.Creating and exporting components\r\n3.Props and passing data\r\n4.Event handling in React\r\n5.Passing arguments to event handlers\r\n6.Synthetic events','cp0aft385p','msn9jnxe31','','yes','COMMITqh20g9s5o','2024-07-23 10:48:35',0),('t4ld9q3ifq','Routing, Context API','1. Routing using React-Router-DOM2. Context API for login3. Context API for Updating Cart value','cp0aft385p','msn9jnxe31','','yes','COMMITg0bnsqpeq','2024-07-25 10:38:18',0),('tf9k4zndcx','Node topic 1','','cp0aft385p','mpu58020kd','','yes','COMMITjhbgj42i2','2024-07-23 15:36:10',0),('thodizw3jx','Hooks, State, LifeCycle Methods','1.Introduction to hooks2.Using useEffect for side effects3.Mounting (constructor, componentDidMount)4.Updating (componentDidUpdate)5.Unmounting (componentWillUnmount)6.Introduction to state7.Using useState hook8.Updating state','cp0aft385p','msn9jnxe31','','yes','COMMITzo0us77ku','2024-07-23 10:49:13',0),('tkc7uggk1i','Introduction','We will learn about 1.How web works, 2.What is React, 3.ReactDOM, 4.Analogy, 5.Background, 6.Benefits of using React','cp0aft385p','msn9jnxe31','','yes','TestCommit','2024-07-21 12:54:36',1),('trt7c92uox','Form Handling, Fetching Data','1. Form Handling using useRef Hook2. Form Handling using useState Hooks3. Fetching Data from API using Fetch API4. Fetching Data from API using Axios Library','cp0aft385p','msn9jnxe31','','yes','COMMIT658tbxq9u','2024-07-25 10:37:53',0),('tyizcrtrff','Getting Started','1.React in HTML,\n2.React Setup,\n3.Project Structure,\n4.Run React App,\n5.JSX','cp0aft385p','msn9jnxe31','','yes','TestCommit1','2024-07-21 12:54:47',1);
/*!40000 ALTER TABLE `topic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `collegeId` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `courseId` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`collegeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('21B01A12C7','keerthigayathrinissankararao40@gmail.com','keerthi','cp0aft385p',0),('22B01A0511','nagalakshmibandi50@gmail.com','Bandi Nagalakshmi','cp0aft385p',0),('22B01A0542','durgadurga65967@gmail.com','Ganasala Durgadevi','cp0aft385p',0),('22B01A0546','22b01a0546@svecw.edu.in','Garikimukku Niharika','cp0aft385p',0),('22B01A0580','karumurikrishnapriya2116@gmail.com','Karumuri Krishna Priya','cp0aft385p',0),('22B01A05A2','harikaa834@gmail.com','Kunapareddy Harika','cp0aft385p',0),('22B01A05H1','snehithapriscillaganta7890@gmail.com','Snehithapriscilla Ganta','cp0aft385p',0),('22B01A1203','22B01A1203@svecw.edu.in','Akunuri Meghana','cp0aft385p',0),('22B01A1210','mytreyianumolu17@gmail.com','Anumolu Mytreyi','cp0aft385p',0),('22B01A1222','burrrasupriya2003@gmail.com','Burra Supriya','cp0aft385p',0),('22B01A1227','22b01a1227@svecw.edu.in','Pavitra Dakarapu','cp0aft385p',0),('22B01A1230','akshayadesu1@gmail.com','D.Charishma Akshaya','cp0aft385p',0),('22B01A1231','22b01a1231@svecw.edu.in','Devakoti Renuka Ganga','cp0aft385p',0),('22B01A1232','dishajain326@gmail.com','Disha Jain','cp0aft385p',0),('22B01A1239','gajjarapubhuvana@gmail.com','Bhuvana Gajjarapu','cp0aft385p',0),('22B01A1241','gannavarapulalithya@gmail.com','Ganavarapu Lalithya Leela Shree','cp0aft385p',0),('22B01A1243','gellijyothi17@gmail.com','Gelli Jyothi Siva Naga Devi','cp0aft385p',0),('22B01A1250','gunduboguladurgabhavani16@gmail.com','Gundubogula Durga Bhavani','cp0aft385p',0),('22B01A1256','vasudhajogi@gmail.com','Jogi Vasudha','cp0aft385p',0),('22B01A1280','22b01a1280@svecw.edu.in','Kothapalli Raja Sri','cp0aft385p',0),('22B01A1292','22b01a1292@svecw.edu.in','Yamini Mallula','cp0aft385p',0),('22B01A1299','22b01a1299@svecw.edu.in','Nikitha Metta','cp0aft385p',0),('22B01A12A0','22b01a12a0@svecw.edu.in','Kalyani Mucharla','cp0aft385p',0),('22B01A12B3','22b01a12b3@svecw.edu.in','Annapurna N','cp0aft385p',0),('22B01A12D2','akkimsetti.manasalakshmi@gmail.com','Akkimsetti Manasa Lakshmi','cp0aft385p',0),('22B01A12D4','geethamruthach@gmail.com','Chakka Geethamrutha','cp0aft385p',0),('22B01A12E2','pulladivya18@gmail.com','Pulla Divya','cp0aft385p',0),('22B01A12E3','akshayapusarla15@gmail.com','Akshaya Pusarla','cp0aft385p',0),('22B01A12E5','ramathulasipuvvada@gmail.com','Puvvada Rama Thulasi','cp0aft385p',0),('22B01A12G3','shaikafreent@gmail.com','Shaik Afreen Tabassum','cp0aft385p',0),('22B01A12H1','sujana.devitadisetty@gmail.com','Tadisetty Sujana Devi','cp0aft385p',0),('22B01A12H7','hemavarshitha08@gmail.com','TIRUMANI HEMA VARSHITHA','cp0aft385p',0),('22B01A12I1','vaishnavivns2005@gmail.com','Vasa Vaishnavi Viveka Naga Srisailam','cp0aft385p',0),('22B01A12I3','mohini782005@gmail.com','Vemavarapu Mohini Jagadambha','cp0aft385p',0),('22B01A12I4','manognavemu@gmail.com','Vemu Manojna','cp0aft385p',0),('22B01A4208','gayatriarigela87@gmail.com','Arigela Gayatri Sai Lakshmi','cp0aft385p',0),('22B01A4221','harikaa.ch22@gmail.com','Ch.Ranga Harika','cp0aft385p',0),('22B01A4227','22b01a4227@svecw.edu.in','Doppalapudi Vijaya Lakshmi','cp0aft385p',0),('22B01A4228','bhanutejaswidulam@gmail.com','Dulam Bhanu Tejaswi','cp0aft385p',0),('22B01A4246','iamsaideepika@gmail.com','Karuturi.Sai Deepika','cp0aft385p',0),('22B01A4247','22b01a4247@svecw.edu.in','Kesavarapu Lakshmi Sai Sowjanya','cp0aft385p',0),('22B01A4248','22b01a4248@svecw.edu.in','K.Chandana','cp0aft385p',0),('22B01A4253','22b01a4253@svecw.edu.in','Kudupudi Bindu Shree','cp0aft385p',0),('22B01A4258','satwikamaddula96@gmail.com','Maddula Naga Padma Purna Sai Satwika','cp0aft385p',0),('22B01A4262','msrikavya2004@gmail.com','M Sri Kavya','cp0aft385p',0),('22B01A4264','mamillatejaswini345@gmail.com','Mamilla Tejaswini','cp0aft385p',0),('22B01A4265','devisaranyamanthena@gmail.com','Manthena Devi Saranya','cp0aft385p',0),('22B01A4266','bhavana.matta2004@gmail.com','Matta Bhavana','cp0aft385p',0),('22B01A4267','bhavyareddy2175@gmail.com','Medapati Bhavya Sai Sri','cp0aft385p',0),('22B01A4274','likhithachowdary333@gmail.com','Likhitha Nimmalapudi','cp0aft385p',0),('22B01A4275','gayathripamarthi04@gmail.com','Gayathri Pamarthi','cp0aft385p',0),('22B01A4276','leelasri4276@gmail.com','Pappu Leela Sowmya Sri','cp0aft385p',0),('22B01A4281','patnalasatyatejaswini@gmail.com','Satya Tejaswini','cp0aft385p',0),('22B01A4287','anuhyaponnaganti9404@gmail.com','Ponnaganti Anuhya','cp0aft385p',0),('22B01A4288','ramyasripulagam5@gmail.com','P.Ramya Sri','cp0aft385p',0),('22B01A4296','harshinisegu7@gmail.com','Segu Siva Harshini','cp0aft385p',0),('22B01A4297','shaikrafiyaalfiya@gmail.com','SHAIK ALFIYA','cp0aft385p',0),('22B01A4298','ishashaik005@gmail.com','Isha Firdous Shaik','cp0aft385p',0),('22B01A42A1','jahnavireddysomu@gmail.com','Somu Jahnavi Reddy','cp0aft385p',0),('22B01A42A5','kyathirekha2004@gmail.com','T.Kyathi Rekha','cp0aft385p',0),('22B01A42A7','22b01a42a7@svecw.edu.in','Thotakura Venkata Suchithra','cp0aft385p',0),('22B01A42A9','22b01a42a9@svecw.edu.in','T Vasavika','cp0aft385p',0),('22B01A42B0','trisha.koduri@gmail.com','Trisha Koduri','cp0aft385p',0),('22B01A42B2','nithyasanthoshinivandanala@gmail.com','Vandanala Nithyasanthoshini','cp0aft385p',0),('22B01A42B3','durgavardhineedi33@gmail.com','V Durga Devi','cp0aft385p',0),('22B01A42B4','samatha9104@gmail.com','V Samatha','cp0aft385p',0),('22B01A42B7','meenakshivinjamuri04@gmail.com','V.Meenakshi','cp0aft385p',0),('22B01A42C0','suvarnayarramreddy@gmail.com','Yarramreddy Suvarna','cp0aft385p',0),('22B01A4514','22b01a4514@svecw.edu.in','Chandana Purna Sai Haritha','cp0aft385p',0),('22B01A4518','jahnavichinta6@gmail.com','Jahnavi Chinta','cp0aft385p',0),('22B01A4543','22b01a4543@svecw.edu.in','Kilari Manasa','cp0aft385p',0),('22B01A4561','sneha.marre@gmail.com','Marre Sneha Sree Priya','cp0aft385p',0),('22B01A4563','umaprasanna0722@gmail.com','Medapati Uma Prasanna','cp0aft385p',0),('22B01A4575','nagayaswithanunna@gmail.com','Nunna Naga Yaswitha','cp0aft385p',0),('22B01A4579','likithasrinu5@gmail.com','Pandi Likitha','cp0aft385p',0),('22B01A4581','anithapathuri5@gmail.com','Pathuri Anitha','cp0aft385p',0),('22B01A4583','meherpentapati@gmail.com','Pentapati Meher Vijaya Lakshmi','cp0aft385p',0),('22B01A4585','thrishitha26@gmail.com','P.Thrishitha','cp0aft385p',0),('22B01A4594','ravulayasaswini@gmail.com','Ravula Yasaswini','cp0aft385p',0),('22B01A4599','22b01a4599@svecw.edu.in','Rishitha Sagiraju','cp0aft385p',0),('22B01A45A0','tejaswinisajja25@gmail.com','S.Tejaswini Surya Sindhu','cp0aft385p',0),('22B01A45A5','preethisomu05@gmail.com','Somu Preethi','cp0aft385p',0),('22B01A45B3','22b01a45b3@svecw.edu.in','Priya Nandini Vaka','cp0aft385p',0),('22B01A4605','prasannabetha13@gmail.com','Betha Prasanna','cp0aft385p',0),('22B01A4607','lohithatrimurthulu@gmail.com','B.Lohitha','cp0aft385p',0),('22B01A4610','mounatejaswichattu@gmail.com','Chattu Mouna Tejaswi','cp0aft385p',0),('22B01A4614','bhavanidusanapudi75@gmail.com','Dusanapudi Lakshmi Bhavani','cp0aft385p',0),('22B01A4624','-','K.Madhuri Priya','cp0aft385p',0),('22B01A4626','lakshmikalyanikonatala9@gmail.com','Konatala Lakshmi Kalyani','cp0aft385p',0),('22B01A4632','saadiyamd786@gmail.com','Mohammad Saadiya','cp0aft385p',0),('22B01A4634','varshininaru2004@gmail.com','Naru Venkata Naga Prasanna Varshini','cp0aft385p',0),('22B01A4638','22b01a4638@svecw.edu.in','Peethani Sheela Saini','cp0aft385p',0),('22B01A4643','22b01a4643@svecw.edu.in','Rayapati Vigna','cp0aft385p',0),('22B01A4644','lehariyabanu@gmail.com','Shaik Lehariya Banu','cp0aft385p',0),('22B01A4646','yaminisuru1@gmail.com','Suru Yamini','cp0aft385p',0),('22B01A4652','varreyasaswini294@gmail.com ','Varre Yasaswini','cp0aft385p',0),('23B05A1207','23b05a1207@svecw.edu.in','Gali Lakshmi Sowjanya','cp0aft385p',0),('23B05A1210','23b05a1210@svecw.edu.in','Palakollu Tulasi Lakshmi','cp0aft385p',0),('23B05A4510','pallapuankitha79@gmail.com','Ankitha','cp0aft385p',0),('23B05A4512','manasaundapalli22@gmail.com','Undapalli Manasa Lakshmi Sri','cp0aft385p',0),('23B05A4602','sujithakantamani@gmail.com','Kantamani Subbalakshmi','cp0aft385p',0),('ss33','newtonpavan33@gmail.com','Pavan','cp0aft385p',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-29 18:02:30
