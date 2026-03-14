-- ============================================
-- TravelMind — Seed Data for `places` Table
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

INSERT INTO places (id, name, city, category, latitude, longitude, rating, average_visit_duration_hours, best_time_of_day)
VALUES
-- ──────────────────────────────────────────────
-- GOA (25 places)
-- ──────────────────────────────────────────────
(1, 'Baga Beach', 'Goa', 'beach', 15.5553, 73.7517, 4.6, 2, 'evening'),
(2, 'Calangute Beach', 'Goa', 'beach', 15.5439, 73.7553, 4.4, 2, 'morning'),
(3, 'Anjuna Beach', 'Goa', 'beach', 15.5735, 73.7414, 4.5, 2, 'evening'),
(4, 'Fort Aguada', 'Goa', 'historical', 15.4929, 73.7735, 4.5, 1.5, 'morning'),
(5, 'Basilica of Bom Jesus', 'Goa', 'cultural', 15.5009, 73.9116, 4.7, 1, 'morning'),
(6, 'Se Cathedral', 'Goa', 'cultural', 15.5040, 73.9127, 4.4, 1, 'morning'),
(7, 'Dudhsagar Falls', 'Goa', 'nature', 15.3144, 74.3143, 4.8, 4, 'morning'),
(8, 'Anjuna Flea Market', 'Goa', 'shopping', 15.5740, 73.7410, 4.2, 2, 'afternoon'),
(9, 'Tito''s Lane', 'Goa', 'nightlife', 15.5550, 73.7515, 4.3, 3, 'night'),
(10, 'Club Cubana', 'Goa', 'nightlife', 15.5685, 73.7680, 4.1, 3, 'night'),
(11, 'Palolem Beach', 'Goa', 'beach', 15.0100, 74.0232, 4.7, 3, 'evening'),
(12, 'Chapora Fort', 'Goa', 'historical', 15.6045, 73.7386, 4.4, 1, 'evening'),
(13, 'Mapusa Market', 'Goa', 'shopping', 15.5912, 73.8097, 4.0, 1.5, 'morning'),
(14, 'Shri Mangeshi Temple', 'Goa', 'cultural', 15.4520, 73.9750, 4.5, 1, 'morning'),
(15, 'Reis Magos Fort', 'Goa', 'historical', 15.4943, 73.8048, 4.3, 1, 'afternoon'),
(16, 'Morjim Beach', 'Goa', 'beach', 15.6276, 73.7299, 4.3, 2, 'morning'),
(17, 'Curlies Beach Shack', 'Goa', 'restaurant', 15.5730, 73.7408, 4.1, 1.5, 'evening'),
(18, 'Martin''s Corner', 'Goa', 'restaurant', 15.2963, 73.9862, 4.5, 1.5, 'evening'),
(19, 'Spice Plantation Tour', 'Goa', 'nature', 15.4622, 74.0144, 4.3, 2, 'morning'),
(20, 'Casino Pride', 'Goa', 'nightlife', 15.4017, 73.8792, 4.0, 3, 'night'),
(21, 'Vagator Beach', 'Goa', 'beach', 15.5970, 73.7350, 4.5, 2, 'evening'),
(22, 'Museum of Christian Art', 'Goa', 'cultural', 15.5020, 73.9115, 4.0, 1, 'afternoon'),
(23, 'Dona Paula Viewpoint', 'Goa', 'nature', 15.4540, 73.8043, 4.2, 1, 'evening'),
(24, 'Fontainhas Latin Quarter', 'Goa', 'historical', 15.4964, 73.8270, 4.4, 1.5, 'afternoon'),
(25, 'Saturday Night Market (Arpora)', 'Goa', 'shopping', 15.5620, 73.7650, 4.3, 2, 'night'),

-- ──────────────────────────────────────────────
-- JAIPUR (25 places)
-- ──────────────────────────────────────────────
(26, 'Amber Fort', 'Jaipur', 'historical', 26.9855, 75.8513, 4.8, 3, 'morning'),
(27, 'Hawa Mahal', 'Jaipur', 'historical', 26.9239, 75.8267, 4.7, 1, 'morning'),
(28, 'City Palace Jaipur', 'Jaipur', 'historical', 26.9258, 75.8237, 4.6, 2, 'morning'),
(29, 'Jantar Mantar', 'Jaipur', 'historical', 26.9247, 75.8244, 4.5, 1.5, 'morning'),
(30, 'Nahargarh Fort', 'Jaipur', 'historical', 26.9376, 75.8156, 4.5, 2, 'evening'),
(31, 'Jaigarh Fort', 'Jaipur', 'historical', 26.9860, 75.8416, 4.3, 1.5, 'morning'),
(32, 'Albert Hall Museum', 'Jaipur', 'cultural', 26.9117, 75.8192, 4.4, 1.5, 'afternoon'),
(33, 'Jal Mahal', 'Jaipur', 'nature', 26.9530, 75.8461, 4.3, 0.5, 'evening'),
(34, 'Birla Mandir Jaipur', 'Jaipur', 'cultural', 26.8920, 75.8100, 4.5, 1, 'evening'),
(35, 'Johari Bazaar', 'Jaipur', 'shopping', 26.9205, 75.8279, 4.3, 2, 'afternoon'),
(36, 'Bapu Bazaar', 'Jaipur', 'shopping', 26.9160, 75.8230, 4.1, 2, 'afternoon'),
(37, 'Chokhi Dhani', 'Jaipur', 'restaurant', 26.7750, 75.8210, 4.5, 3, 'evening'),
(38, 'Patrika Gate', 'Jaipur', 'cultural', 26.8980, 75.8090, 4.4, 1, 'afternoon'),
(39, 'Galtaji Temple (Monkey Temple)', 'Jaipur', 'cultural', 26.9197, 75.8570, 4.2, 1.5, 'morning'),
(40, 'Sisodia Rani Garden', 'Jaipur', 'nature', 26.9020, 75.8690, 4.0, 1, 'morning'),
(41, 'Elefantastic Elephant Sanctuary', 'Jaipur', 'nature', 26.9530, 75.8480, 4.6, 2, 'morning'),
(42, 'Panna Meena ka Kund', 'Jaipur', 'historical', 26.9820, 75.8530, 4.3, 0.5, 'morning'),
(43, 'Raj Mandir Cinema', 'Jaipur', 'cultural', 26.9148, 75.8047, 4.2, 2.5, 'evening'),
(44, 'Anokhi Museum of Hand Printing', 'Jaipur', 'cultural', 26.9870, 75.8490, 4.1, 1, 'afternoon'),
(45, '1135 AD Restaurant', 'Jaipur', 'restaurant', 26.9857, 75.8510, 4.6, 1.5, 'evening'),
(46, 'Tapri Central', 'Jaipur', 'restaurant', 26.9120, 75.8050, 4.3, 1, 'evening'),
(47, 'Bar Palladio', 'Jaipur', 'nightlife', 26.8860, 75.7900, 4.5, 2, 'night'),
(48, 'Blackout Jaipur', 'Jaipur', 'nightlife', 26.8880, 75.7560, 4.0, 2.5, 'night'),
(49, 'Central Park Jaipur', 'Jaipur', 'nature', 26.9020, 75.8100, 4.2, 1, 'evening'),
(50, 'Rambagh Palace Grounds', 'Jaipur', 'historical', 26.8970, 75.8050, 4.7, 1.5, 'afternoon'),

-- ──────────────────────────────────────────────
-- MANALI (25 places)
-- ──────────────────────────────────────────────
(51, 'Solang Valley', 'Manali', 'nature', 32.3150, 77.1574, 4.7, 4, 'morning'),
(52, 'Rohtang Pass', 'Manali', 'nature', 32.3722, 77.2478, 4.8, 5, 'morning'),
(53, 'Hadimba Temple', 'Manali', 'cultural', 32.2427, 77.1893, 4.6, 1, 'morning'),
(54, 'Old Manali', 'Manali', 'shopping', 32.2565, 77.1870, 4.4, 2.5, 'afternoon'),
(55, 'Manu Temple', 'Manali', 'cultural', 32.2535, 77.1880, 4.2, 0.5, 'morning'),
(56, 'Vashisht Hot Water Springs', 'Manali', 'nature', 32.2697, 77.1823, 4.3, 1, 'morning'),
(57, 'Jogini Waterfall', 'Manali', 'nature', 32.2610, 77.1960, 4.5, 3, 'morning'),
(58, 'Tibetan Monastery Manali', 'Manali', 'cultural', 32.2430, 77.1890, 4.3, 1, 'afternoon'),
(59, 'Mall Road Manali', 'Manali', 'shopping', 32.2396, 77.1887, 4.1, 2, 'evening'),
(60, 'Beas River Rafting Point', 'Manali', 'nature', 32.1920, 77.1680, 4.6, 2, 'morning'),
(61, 'Naggar Castle', 'Manali', 'historical', 32.1362, 77.1704, 4.4, 1.5, 'afternoon'),
(62, 'Nehru Kund', 'Manali', 'nature', 32.2980, 77.1900, 4.0, 0.5, 'morning'),
(63, 'Jana Waterfall', 'Manali', 'nature', 32.0980, 77.1200, 4.2, 2, 'morning'),
(64, 'Atal Tunnel', 'Manali', 'nature', 32.3974, 77.1558, 4.7, 1.5, 'morning'),
(65, 'Hampta Pass Trailhead', 'Manali', 'nature', 32.2530, 77.2130, 4.8, 6, 'morning'),
(66, 'Nicholas Roerich Art Gallery', 'Manali', 'cultural', 32.1365, 77.1710, 4.3, 1, 'afternoon'),
(67, 'Lazy Dog Lounge', 'Manali', 'restaurant', 32.2560, 77.1875, 4.3, 1.5, 'evening'),
(68, 'Johnson''s Cafe', 'Manali', 'restaurant', 32.2420, 77.1880, 4.4, 1.5, 'afternoon'),
(69, 'Drifters'' Inn & Cafe', 'Manali', 'restaurant', 32.2550, 77.1870, 4.2, 1, 'evening'),
(70, 'Club House Manali', 'Manali', 'nature', 32.2410, 77.1910, 4.0, 1.5, 'afternoon'),
(71, 'Van Vihar National Park', 'Manali', 'nature', 32.2420, 77.1820, 4.1, 1.5, 'morning'),
(72, 'Manali Gompa', 'Manali', 'cultural', 32.2420, 77.1895, 4.2, 0.5, 'morning'),
(73, 'Cafe 1947', 'Manali', 'nightlife', 32.2570, 77.1860, 4.3, 2, 'night'),
(74, 'The Manali Inn', 'Manali', 'nightlife', 32.2400, 77.1885, 4.0, 2, 'night'),
(75, 'Gulaba Viewpoint', 'Manali', 'nature', 32.3260, 77.1960, 4.4, 1, 'morning'),

-- ──────────────────────────────────────────────
-- UDAIPUR (25 places)
-- ──────────────────────────────────────────────
(76, 'City Palace Udaipur', 'Udaipur', 'historical', 24.5764, 73.6913, 4.8, 3, 'morning'),
(77, 'Lake Pichola', 'Udaipur', 'nature', 24.5714, 73.6814, 4.7, 2, 'evening'),
(78, 'Jag Mandir', 'Udaipur', 'historical', 24.5671, 73.6833, 4.6, 1.5, 'afternoon'),
(79, 'Taj Lake Palace (Exterior View)', 'Udaipur', 'historical', 24.5756, 73.6826, 4.8, 1, 'evening'),
(80, 'Saheliyon ki Bari', 'Udaipur', 'nature', 24.5914, 73.6997, 4.4, 1, 'morning'),
(81, 'Jagdish Temple', 'Udaipur', 'cultural', 24.5778, 73.6905, 4.5, 0.5, 'morning'),
(82, 'Fateh Sagar Lake', 'Udaipur', 'nature', 24.6015, 73.6809, 4.5, 1.5, 'evening'),
(83, 'Monsoon Palace (Sajjangarh)', 'Udaipur', 'historical', 24.5790, 73.6454, 4.3, 1.5, 'evening'),
(84, 'Bagore ki Haveli', 'Udaipur', 'cultural', 24.5761, 73.6880, 4.4, 1.5, 'evening'),
(85, 'Shilpgram Artists'' Village', 'Udaipur', 'cultural', 24.6130, 73.6490, 4.2, 2, 'afternoon'),
(86, 'Vintage Car Museum', 'Udaipur', 'cultural', 24.5850, 73.6750, 4.1, 1, 'afternoon'),
(87, 'Ambrai Ghat', 'Udaipur', 'nature', 24.5740, 73.6850, 4.5, 1, 'evening'),
(88, 'Hathi Pol Bazaar', 'Udaipur', 'shopping', 24.5760, 73.6910, 4.2, 2, 'afternoon'),
(89, 'Bada Bazaar', 'Udaipur', 'shopping', 24.5750, 73.6920, 4.0, 1.5, 'afternoon'),
(90, 'Ambrai Restaurant', 'Udaipur', 'restaurant', 24.5742, 73.6849, 4.6, 1.5, 'evening'),
(91, 'Upre by 1559 AD', 'Udaipur', 'restaurant', 24.5770, 73.6910, 4.5, 1.5, 'evening'),
(92, 'Savage Garden Restaurant', 'Udaipur', 'restaurant', 24.5765, 73.6895, 4.3, 1.5, 'evening'),
(93, 'Udaipur Night Boat Ride', 'Udaipur', 'nightlife', 24.5720, 73.6810, 4.5, 1, 'night'),
(94, 'Panera Bar (Leela Palace)', 'Udaipur', 'nightlife', 24.5686, 73.6674, 4.4, 2, 'night'),
(95, 'Ahar Cenotaphs', 'Udaipur', 'historical', 24.5850, 73.7100, 4.0, 1, 'morning'),
(96, 'Nehru Garden (Island Park)', 'Udaipur', 'nature', 24.6020, 73.6790, 4.1, 1, 'afternoon'),
(97, 'Karni Mata Ropeway', 'Udaipur', 'nature', 24.5650, 73.6810, 4.3, 1, 'evening'),
(98, 'Eklingji Temple', 'Udaipur', 'cultural', 24.7270, 73.7200, 4.5, 1, 'morning'),
(99, 'Moti Magri', 'Udaipur', 'historical', 24.5940, 73.6780, 4.2, 1, 'morning'),
(100, 'Doodh Talai Musical Garden', 'Udaipur', 'nature', 24.5700, 73.6850, 4.0, 1, 'evening'),

-- ──────────────────────────────────────────────
-- KERALA (25 places)
-- ──────────────────────────────────────────────
(101, 'Alleppey Backwaters (Houseboat)', 'Kerala', 'nature', 9.4981, 76.3388, 4.9, 8, 'morning'),
(102, 'Munnar Tea Gardens', 'Kerala', 'nature', 10.0889, 77.0595, 4.8, 3, 'morning'),
(103, 'Fort Kochi Beach', 'Kerala', 'beach', 9.9639, 76.2430, 4.5, 2, 'evening'),
(104, 'Chinese Fishing Nets (Fort Kochi)', 'Kerala', 'cultural', 9.9676, 76.2420, 4.4, 1, 'evening'),
(105, 'Athirapally Falls', 'Kerala', 'nature', 10.2856, 76.5698, 4.7, 2, 'morning'),
(106, 'Periyar Wildlife Sanctuary', 'Kerala', 'nature', 9.4680, 77.1717, 4.6, 4, 'morning'),
(107, 'Kovalam Beach', 'Kerala', 'beach', 8.3988, 76.9789, 4.5, 3, 'evening'),
(108, 'Varkala Cliff', 'Kerala', 'nature', 8.7332, 76.7167, 4.6, 2, 'evening'),
(109, 'Padmanabhaswamy Temple', 'Kerala', 'cultural', 8.4825, 76.9441, 4.7, 1.5, 'morning'),
(110, 'Mattancherry Palace', 'Kerala', 'historical', 9.9583, 76.2588, 4.3, 1, 'morning'),
(111, 'Jewish Synagogue (Paradesi)', 'Kerala', 'cultural', 9.9574, 76.2597, 4.4, 0.5, 'morning'),
(112, 'Eravikulam National Park', 'Kerala', 'nature', 10.1672, 77.0622, 4.5, 3, 'morning'),
(113, 'Kumarakom Bird Sanctuary', 'Kerala', 'nature', 9.5924, 76.4293, 4.4, 2, 'morning'),
(114, 'Jew Street (Spice Market)', 'Kerala', 'shopping', 9.9570, 76.2600, 4.3, 1.5, 'afternoon'),
(115, 'Lulu Mall Kochi', 'Kerala', 'shopping', 9.9920, 76.3094, 4.2, 2.5, 'afternoon'),
(116, 'Beypore Beach', 'Kerala', 'beach', 11.1620, 75.8107, 4.2, 2, 'evening'),
(117, 'Kerala Kathakali Centre', 'Kerala', 'cultural', 9.9670, 76.2430, 4.5, 2, 'evening'),
(118, 'Paragon Restaurant', 'Kerala', 'restaurant', 11.2588, 75.7804, 4.5, 1, 'afternoon'),
(119, 'Kayees Rahmathulla Hotel', 'Kerala', 'restaurant', 9.9690, 76.2850, 4.4, 1, 'afternoon'),
(120, 'Dal Roti Restaurant (Fort Kochi)', 'Kerala', 'restaurant', 9.9645, 76.2435, 4.3, 1, 'evening'),
(121, 'Wayanad Tree House', 'Kerala', 'nature', 11.6854, 76.1320, 4.5, 4, 'morning'),
(122, 'Napier Museum', 'Kerala', 'cultural', 8.5089, 76.9576, 4.2, 1.5, 'afternoon'),
(123, 'Marari Beach', 'Kerala', 'beach', 9.5941, 76.2924, 4.6, 3, 'morning'),
(124, 'Thalassery Fort', 'Kerala', 'historical', 11.7475, 75.4857, 4.1, 1, 'afternoon'),
(125, 'Papanasam Beach', 'Kerala', 'beach', 8.7380, 76.7100, 4.4, 2, 'evening');

-- Reset the serial sequence to continue after ID 125
SELECT setval('places_id_seq', 125, true);

-- ============================================
-- Verify the seed data
-- ============================================
-- Uncomment the line below to check counts per city:
-- SELECT city, COUNT(*) as total FROM places GROUP BY city ORDER BY city;
