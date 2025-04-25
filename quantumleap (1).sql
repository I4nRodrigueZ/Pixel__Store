-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-04-2025 a las 07:22:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `quantumleap`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alembic_version`
--

CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alembic_version`
--

INSERT INTO `alembic_version` (`version_num`) VALUES
('bc7e24a83fa4');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id`, `usuario_id`, `total`) VALUES
(1, 1, 39);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`) VALUES
(1, 'Accion'),
(2, 'Aventura'),
(3, 'Terror');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_carrito`
--

CREATE TABLE `detalle_carrito` (
  `carrito_id` int(11) NOT NULL,
  `juego_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_con_descuento` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_factura`
--

CREATE TABLE `detalle_factura` (
  `factura_id` int(11) NOT NULL,
  `juego_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_factura`
--

INSERT INTO `detalle_factura` (`factura_id`, `juego_id`, `cantidad`) VALUES
(1, 24, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `divisas`
--

CREATE TABLE `divisas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `simbolo` varchar(10) NOT NULL,
  `tipo_cambio` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `divisas`
--

INSERT INTO `divisas` (`id`, `nombre`, `simbolo`, `tipo_cambio`) VALUES
(1, 'Dólar estadounidense', 'USD', 1),
(2, 'Euro', 'EUR', 1.08),
(3, 'Libra esterlina', 'GBP', 1.25),
(4, 'Yen japonés', 'JPY', 0.0065),
(5, 'Franco suizo', 'CHF', 1.1),
(6, 'Dólar canadiense', 'CAD', 0.73),
(7, 'Dólar australiano', 'AUD', 0.65),
(8, 'Peso mexicano', 'MXN', 0.058),
(9, 'Real brasileño', 'BRL', 0.2),
(10, 'Peso argentino', 'ARS', 0.0011),
(11, 'Peso chileno', 'CLP', 0.0011),
(12, 'Yuan chino', 'CNY', 0.14),
(13, 'Won surcoreano', 'KRW', 0.00074),
(14, 'Rupia india', 'INR', 0.012),
(15, 'Rublo ruso', 'RUB', 0.011),
(16, 'Lira turca', 'TRY', 0.031),
(17, 'Dólar neozelandés', 'NZD', 0.6),
(18, 'Corona sueca', 'SEK', 0.093),
(19, 'Corona noruega', 'NOK', 0.09),
(20, 'Rand sudafricano', 'ZAR', 0.053);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `monto_subtotal` float NOT NULL,
  `impuestos` float NOT NULL,
  `total` float NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `divisa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura`
--

INSERT INTO `factura` (`id`, `fecha`, `monto_subtotal`, `impuestos`, `total`, `metodo_pago`, `divisa_id`, `usuario_id`) VALUES
(1, '2025-04-25 01:19:51', 39, 7.41, 46.41, 'Nequi', 20, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juego`
--

CREATE TABLE `juego` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `precio` float NOT NULL,
  `stock` int(11) NOT NULL,
  `condicion` varchar(50) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `imagen_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `juego`
--

INSERT INTO `juego` (`id`, `titulo`, `descripcion`, `precio`, `stock`, `condicion`, `categoria_id`, `imagen_url`) VALUES
(1, 'Minecraft: Java & Bedrock Edition Official website Key GLOBAL', 'Explora mundos generados al azar y construye cosas increíbles, desde las casas más sencillas hasta los castillos más grandiosos. Juega en modo creativo con recursos ilimitados o excava hasta las profundidades del mundo en el modo supervivencia, donde deberás fabricar armas y armaduras para defenderte de las criaturas peligrosas. Escala montañas escarpadas, explora cuevas complejas y extrae grandes vetas de minerales. Descubre los biomas de cuevas y espeleotemas fascinantes. ¡Ilumina tu mundo con', 18.8, 12, 'Nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745533830/Minecraft-creeper-face_mbopyb.jpg'),
(2, 'Outlast', 'El horror aguarda en las lejanas montañas de Colorado, dentro del manicomio del monte Massive. Tras pasar años abandonado, el psiquiátrico ha vuelto a abrir sus puertas. El departamento de “investigación y caridad” de la corporación transnacional Murkoff ha estado trabajando en su interior en la más estricta clandestinidad... hasta ahora.\n\nSiguiendo el consejo de una fuente anónima, el periodista independiente Miles Upshur irrumpe en el complejo. Lo que descubre en su interior traza una aterrado', 16, 12, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745534693/outlas_kdkjle.avif'),
(3, 'Blasphemous 2', 'Blasphemous es un juego de acción y plataformas muy difícil que combina el ritmo rápido y el combate de un hack-n-slash con una narrativa profunda y evocadora, presentada al explorar un universo enorme hecho de niveles no lineales.\n\nUna terrible maldición conocida como el Milagro ha caído sobre en la tierra de Cvstodia y sus habitantes.\n\nEres el Penitente, el único superviviente de la masacre de la \"Pena Silente\". Estás atrapado en un ciclo eterno de muerte y resurrección, y solo tú puedes libra', 19, 2, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745535095/blas_ewxdjo.jpg'),
(4, 'Red Dead Redemption 2', 'Incluye Red Dead Redemption 2: Modo Historia y Red Dead Online.\n\nCon más de 175 premios al \"Juego del año\" y más de 250 valoraciones perfectas, Red Dead Redemption 2 es una historia épica sobre el honor y la lealtad en los albores del siglo XX.\n\nEstados Unidos, 1899. Arthur Morgan y la banda de Van der Linde son forajidos buscados. Con agentes federales y los mejores cazarrecompensas pisándoles los talones, la banda deberá abrirse camino por el salvaje territorio del corazón de Estados Unidos a ', 54, 20, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745535328/red_dead_3_se36ed.jpg'),
(5, 'God of War (PC)', 'Un nuevo rostro de God of War\nA diferencia de las partes de la antigua serie, en el juego God of War (PC) Código de Steam verás el juego desde la perspectiva en tercera persona, cerca de la espalda de Kratos, lo que hace que la brutal acción sea mucho más personal y cercana. La mitología de la serie también ha cambiado. En las primeras partes de los juegos de God of War, la historia se desarrollaba en el trasfondo de la antigua mitología griega, esta vez viajarás por Escandinavia, y más concreta', 42, 14, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745535492/god_kmqhac.jpg'),
(6, 'Assassin’s Creed Shadows', 'Assassin\'s Creed: Shadows te lleva al corazón del Japón feudal, donde la antigua orden de los Asesinos se enfrenta al despiadado poder de los Templarios en un mundo lleno de honor, intriga y peligro. Desarrollada por Ubisoft, esta entrega de la emblemática serie Assassin\'s Creed te lleva de viaje por un mundo meticulosamente elaborado, donde cada sombra esconde un secreto. Ambientada en el periodo Edo, una época en la que los samuráis gobernaban con puño de hierro, te encontrarás navegando por e', 53, 3, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745535745/assassins-creed-shadows_ksec3i.jpg'),
(7, 'Ghost of Tsushima', 'Ghost of Tsushima – a Love Letter to Japan and Samurai in a Video Game Form\nImmerse yourself in the beauty of ancient Japan as you fight against ruthless Mongol invaders in Ghost of Tsushima! Developed by Sucker Punch Productions and published by Sony Interactive Entertainment, this action-adventure stealth title transports players to the 13th century, the stunning island of Tsushima - the last obstacle between mainland Japan and the tremendous Mongol empire. Embody Jin Sakai, the last surviving', 43, 2, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745536112/ghost_spwtnt.jpg'),
(8, 'Dark Souls: Remastered', 'Dark Souls: Remastered es la reencarnación 4k HDR del juego original de Dark Souls desarrollado por Bandai Namco. Junto a gráficos mejorados, calidad y mejores FPS, también tendrás acceso al juego básico de Dark Souls, junto al DLC Artorias del Abismo y el modo multijugador expandido, donde hasta 6 personas pueden participar en peligrosos retos juntos.\n\nDark Souls es conocido por su extraordinaria complejidad, terrenos sin piedad, y el hecho de que la suerte nunca está de tu lado. El juego favor', 31.08, 22, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745536296/dark1_omcmor.jpg'),
(9, 'UNCHARTED: Legacy of Thieves Collection', 'Busca tu legado y deja tu marca en el mapa en UNCHARTED: Colección Legado de ladrones. Disfruta de los escenarios de acción cinematográfica y de la emocionante experiencia de juego de alto impacto de la icónica franquicia de Naughty Dog.\n\nDescubre la historia perdida con los carismáticos, aunque complejos, ladrones, Nathan Drake y Chloe Frazer, mientras viajan por el mundo con un sentido de curiosidad en busca de aventuras extraordinarias y la historia perdida.\n\nUNCHARTED: Colección Legado de la', 41, 22, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745536778/unchaL_loqdcd.jpg'),
(10, 'Marvel\'s Spider-Man 2', 'Prepárate para la esperadísima secuela de la aclamada serie Marvel\'s Spider-Man a cargo de Insomniac Games. Spider-Man 2 continúa la emocionante historia de Peter Parker y Miles Morales, dos hombres araña que se unen en su capítulo más peligroso y emotivo hasta la fecha. Ambientado en una vibrante y amplia representación de la ciudad de Nueva York de Marvel, permite a los jugadores alternar de forma sencilla entre estos dos héroes icónicos, experimentando un mundo rebosante de acción, desafíos e', 50, 33, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745537035/marvel__039_s_spiderman_2-5929865_ydhf2r.jpg'),
(11, 'Metro Exodus', 'Metro Exodus Gold Edition (PC) Código de Steam ofrece una nueva y única experiencia de acción FPS desarrollada por \"4A Games\". Se trata de la tercera entrega de una conocida serie de acción y survival-horror en la que serás el bueno del personaje Artyom. Con este personaje, descubrirás los secretos místicos de la Moscú postapocalíptica, sus túneles de metro subterráneos y los de arriba. Metro Exodus (PC) Código de Steam continúa la historia después de los juegos anteriores, por lo que los jugado', 8, 12, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745537256/Metro_Exodus_Gold_Edition_exw8cc.jpg'),
(12, 'Call of Duty: Black Ops 6', 'Black Ops 6 - La nueva era de CoD\nTreyarch y Raven Software te traen Call of Duty: Black Ops 6, la última entrega llena de adrenalina de la legendaria serie Black Ops, publicada por Activision. La última entrega de la legendaria serie de shooters en primera persona te sumerge en un mundo de espionaje, traición y acción implacable. Black Ops 6 ofrece una experiencia de infarto con sus emocionantes campañas para un jugador, sus sólidos modos multijugador y el regreso del querido modo Zombis.\n\nBlac', 63.91, 3, 'nuevo', 1, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745537619/call_of_duty_black_ops_6-5892217_idxbom.webp'),
(13, 'The Elder Scrolls IV: Oblivion (GOTY)', 'It is dark times in the RPG of the Elder Scrolls IV: Oblivion. When the Emperor dies, many desperate factions see it as their sign to take the throne of Tamriel. If that\'s not enough, demons start marching through the opened gates of Oblivion and destroying everything that comes in their path.\n\n\nYou are the one, who can fight this darkness: find the one, who should rightfully sit in Tamriel\'s throne before it gets destroyed. Only by finding the heir to Tamriel\'s throne you can find out what is p', 8, 22, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745538329/sv4nva12ensjqmqiqltn_350x200_3x-0_cyyde8.jpg'),
(14, 'The Elder Scrolls V: Skyrim (Special Edition)', 'El juego The Elder Scrolls V: Skyrim es otro capítulo de la famosa saga Elder Scrolls, desarrollado por Bethesda Game Studios. Una experiencia de mundo abierto, una emocionante historia de antaño que cuenta leyendas de gloriosos guerreros que lucharon valientemente en las tierras del Norte, y misiones que mantienen a los mejores jugadores de RPG desafiados y entretenidos: este título lo tiene todo. Aunque salió a la venta hace varios años, el juego ha envejecido bien y ha proporcionado entreteni', 27, 4, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745538648/Skyrim_Cover_wb1qu0.webp'),
(15, 'ARK: Survival Evolved', 'El productor del juego Studio Wildcard ha hecho un trabajo tremendo desarrollando  ARK: Survival Evolved Steam key. Este juego de acción-aventura en un mundo abierto de supervivencia con elementos de rol, te deja en una isla y te pide que sobrevivas. ¿Fácil? ¡No exactamente! Los dinosaurios son los reyes de esta isla entre los diferentes depredadores prehistóricos. ¿Cómo sobrevivirás ante tales condiciones? ¿O serás simplemente un snack para los depredadores? \n\n¡Peligro en todas partes!\nARK: Sur', 82, 100, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745539393/845_ket9gn.jpg'),
(16, 'It Takes Two', 'Hay una razón por la que se dice que se necesitan dos para bailar. Sumérgete en la nueva aventura de acción de Hazelight Studios y Electronic Arts: ¡It Takes Two! Repleto de diversos elementos del género de las plataformas, este título hilarantemente caótico es la elección perfecta para quienes buscan un juego desafiante para dos. Diseñado específicamente para el modo cooperativo a pantalla dividida, de forma local u online, el juego transporta a dos jugadores a las tumultuosas vidas de Cody y M', 24, 21, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745539523/71WOIg3U9hL._AC_UF1000_1000_QL80__hfzvdc.jpg'),
(17, 'Days Gone', '¿Sobrevivirás a los horrores de un mundo moribundo o tu búsqueda de una razón para vivir será en vano? Pon a prueba tu determinación en la nueva entrega de SIE Bend Studio y Sony Interactive Entertainment que combina la acción y la aventura con elementos del género de supervivencia: ¡Days Gone! Adéntrate en un mundo postapocalíptico, cambiado para siempre por una pandemia global que ha convertido a la mayor parte de la humanidad en criaturas nocturnas incontrolables y violentas, más conocidas co', 36, 31, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745539647/EGS_Brutalopenworldactionadventuregame_BendStudio_S2-1200x1600-e1c183cc11fdb47e26581e5ba19aa10a_nvvjh0.jpg'),
(18, 'Kingdom Come: Deliverance', 'Buy Kingdom Come: Deliverance key and enter into a story-driven open-world set in the times of the Holy Roman Empire. The game was developed by Warhorse Studios and it‘s a really cruel medieval piece to play through. Experience the ruthless game’s role-playing nature from the very first steps that you’ll take and know this; it won’t be a walk in the park.\n\nRegular Henry\nBuy Kingdom Come Deliverance Steam key and experience a thrilling story that starts in Bohemia, where your character, the son o', 26, 12, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745540055/kingdom_come_deliverance-3872582_lzehcn.webp'),
(19, 'Stardew Valley', 'Stardew Valley Steam key brings an amazing simulation RPG developed by ConcernedApe. You‘ve just inherited an old farm set in Stardew Valley. All you have is some make-shift tools and a few spare coins jingling in your pocket. Your goal is not only to survive but to make the land flourish in bright green! To achieve the said goal, you’ll have to face numerous challenges and partake in a hefty ton of immersive activities!\n\nPlay Together\nRaise animals, grow crops, craft various machinery, and emba', 44, 2, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745540371/stardew_valley-3324716_g9h3zp.jpg'),
(20, 'Assassin\'s Creed® The Ezio Collection', 'Pasa a formar parte de la historia como Ezio Auditore da Firenze, el maestro Assassin con esta emocionante colección que incluye las campañas para un jugador y todos los contenidos descargables de Assassin\'s Creed II, Assassin\'s Creed La Hermandad y Assassin\'s Creed Revelations, con gráficos mejorados. Disfruta también de Assassin’s Creed Lineage® y Assassin’s Creed Embers™, los dos cortos que completarán la experiencia de Ezio.\n\nEncarna al famoso Ezio Auditore da Firenze. Aprende los secretos d', 50, 1, 'usado', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745540554/MV5BZjUxMTQ3YmQtNDE0OC00NzMyLWE0YWEtY2NjMmYzMDY1MzYzXkEyXkFqcGc_._V1_FMjpg_UX1000__qsbcff.jpg'),
(21, 'Split Fiction', 'Una de las cosas más sorprendentes de los videojuegos es que a menudo apelan a nuestras fantasías y preferencias que de otra manera no pueden tener lugar en el mundo real, y nos permiten realizar actividades desde la comodidad de nuestros hogares. Desarrollado por Hazelight Studios AB y presentado nada menos que por Electronic Arts en 2025-03-06, Split Fiction para Xbox Live ofrece un entorno y una jugabilidad que te atrae desde el principio, ¡y te mantiene ocupado durante horas! Compra Split Fi', 50, 4, 'nuevo', 2, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745540793/12818277_ppys5s.jpg'),
(22, 'Alien: Isolation', 'Descubre el verdadero significado del miedo en Alien: Isolation, un survival horror ambientado en una atmósfera de pavor constante y peligro mortal. Quince años después de los acontecimientos de Alien™, la hija de Ellen Ripley, Amanda se adentra en una desesperada batalla por la supervivencia, en una misión para desentrañar la verdad que se esconde tras la desaparición de su madre.\n\nEn el papel de Amanda, navegarás por un mundo cada vez más volátil mientras te enfrentas por todos lados a una pob', 46, 4, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745541614/dqdjqd_1__tu4g19.webp'),
(23, 'Resident Evil 4 Gold Edition', 'Resident Evil 4 Gold Edition incluye Resident Evil 4 y dos contenidos adicionales: Separate Ways, donde vivirás la historia desde la perspectiva de Ada Wong, y el Extra DLC Pack, que contiene trajes adicionales para los personajes, así como armas y objetos útiles.\n\nResident Evil 4:\nHan pasado 6 años desde el desastre biológico de Raccoon City. Leon S. Kennedy sigue el rastro de la hija desaparecida del presidente hasta un apartado pueblo europeo, donde hay algo terriblemente malo entre sus habit', 50, 12, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745541745/resident_evil_4_gold_edition_1__1_xnetfa.jpg'),
(24, 'Steam Steam The Evil Within', 'Desarrollado por Shinji Mikami, creador de la serie Resident Evil, y el talentoso equipo de Tango Gameworks, The Evil Within encarna el significado del puro horror de la supervivencia. Experimenta una realidad perturbadora mientras intentas liberarte de las maquinaciones retorcidas que sólo podrían existir en los mundos más horribles. Enfréntate a criaturas retorcidas y experimenta el verdadero terror, todo ello potenciado por la iluminación y la animación de última generación que ha sido posibl', 39, 11, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745541962/mordhau-button-01-1558657551015_5__fvqahw.webp'),
(25, 'Steam Steam SILENT HILL 2 - Digital Deluxe', 'Tras recibir una carta de su difunta esposa,\nJames se dirige al lugar donde compartieron tantos recuerdos,\ncon la esperanza de verla una vez más: Silent Hill.\nAllí, junto al lago, encuentra a una mujer inquietantemente parecida a ella...\n\n\"Me llamo... María\", sonríe la mujer. Su cara, su voz... Es igual que ella.\n\nExperimenta una clase magistral de terror psicológico -elegido como el mejor de la serie- en el hardware más reciente, con efectos visuales escalofriantes y sonidos viscerales.', 92, 2, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745542272/silent_hill_2_-_digital_deluxe_lg3k7m.webp'),
(26, 'Steam Steam Resident Evil 2 / Biohazard RE2', 'NOMBRE DEL JUEGO incluye el juego base y los packs de expansión.\nLeon Costume: \"Arklay Sheriff\"\nLeon Costume: \"Noir\"\nDisfraz de Claire: \"Militar\"\nDisfraz de Claire: \"Noir\"\nDisfraz de Claire: \"Elza Walker\"\nArma de lujo: \"Samurai Edge - Modelo Albert\"\n\"Original Ver.\" Intercambio de la banda sonora\nLas 3 razones principales para jugar a Exiliados de Conan - Edición completa\nLos horrores de Resident Evil 2 han regresado en esta hermosa reimaginación de la obra maestra de horror de 1998.\nClaire Redfi', 71, 34, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745542481/re2-de_xca9tu.webp'),
(27, 'A Plague Tale: Requiem', 'Las 3 mejores razones para jugar a A Plague Tale: Requiem\nObligados a huir una vez más, los hermanos ponen sus esperanzas en una isla profetizada que puede tener la clave para salvar a Hugo.\nDescubre el coste de salvar a tus seres queridos en una lucha desesperada por la supervivencia.\nAtaca desde las sombras o desata el infierno, superando enemigos y desafíos con una variedad de armas, herramientas y poderes sobrenaturales.', 58, 2, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745542578/download-ruggnar-offer-rfmng_3__djpwqk.webp'),
(28, 'Unholy', 'Abre las puertas entre tu realidad cotidiana y un oscuro mundo impío para desvelar el misterio de la desaparición de tu hijo. Explora ambos mundos para encontrar pistas, resolver puzles, decidir si te infiltras o luchas contra brutales enemigos y plantar cara a un aberrante establishment.', 33, 21, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745542695/new_project_-_2023-08-09t101222.799_sngdzb.jpg'),
(29, 'Alan Wake 2', 'Una serie de asesinatos rituales amenaza Bright Falls, una pequeña comunidad rodeada por la naturaleza salvaje del noroeste del Pacífico. Saga Anderson, una consumada agente del FBI con fama de resolver casos imposibles llega para investigar los asesinatos. El caso de Anderson se convierte en una pesadilla cuando descubre páginas de una historia de terror que empieza a hacerse realidad a su alrededor.\n\nAlan Wake, un escritor perdido atrapado en una pesadilla más allá de nuestro mundo, escribe un', 66, 1, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745542834/new_project_-_2023-05-25t155114.093_1_ue2fl7.jpg'),
(30, 'Resident Evil 7 - Biohazard Gold Edition', 'Las 3 razones principales para jugar a Resident Evil 7 - Biohazard Gold Edition PC (WW)\nExperimenta uno de los juegos más terroríficos y aclamados de 2017 con Resident Evil 7 Gold Edition.\nExplora la mansión Baker, aparentemente abandonada, y descubre la verdad tras la desaparición de tu mujer.\nLa Gold Edition contiene el juego completo más DLC: las secuencias prohibidas Vol. 1 y 2, y el episodio epílogo End of Zoe.', 53, 32, 'nuevo', 3, 'https://res.cloudinary.com/dtdxmx8ly/image/upload/v1745543430/bkg-cover_4__dxdakn.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juegos_promociones`
--

CREATE TABLE `juegos_promociones` (
  `juego_id` int(11) NOT NULL,
  `promocion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `accion` varchar(200) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `detalles` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promocion`
--

CREATE TABLE `promocion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_descuento` enum('Porcentaje','Monto_Fijo') NOT NULL,
  `valor_descuento` float NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `es_global` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resena`
--

CREATE TABLE `resena` (
  `id` int(11) NOT NULL,
  `juego_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `puntuacion` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `fecha` datetime NOT NULL,
  `editada` tinyint(1) DEFAULT NULL,
  `fecha_edicion` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `rol` enum('ADMIN','USUARIO','VENDEDOR') NOT NULL,
  `fecha_registro` date NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `reset_token` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido`, `email`, `contrasena_hash`, `rol`, `fecha_registro`, `direccion`, `telefono`, `reset_token`) VALUES
(1, 'Diego_el_perron', 'Elperron', 'diegoelperron@gmail.com', 'pbkdf2:sha256:260000$Aly1r4yAUpbN2Ifb$fee924f25e4a7337aa6202ed72c0d7884966bf23f71fbfec055d9722a4da51dc', 'ADMIN', '2025-04-24', 'Dirección del Superadmin', '1234567890', NULL),
(2, 'David_21', 'Gansta_Life', 'davinci21@gmail.com', 'pbkdf2:sha256:260000$lQv6KtnoyQ88s8ND$1e8ac83de83da2016f74e696a9f3de31023a4250c37198386889f5a2618eff6d', 'ADMIN', '2025-04-24', 'Dirección del Superadmin002', '3008353399', NULL),
(3, 'Diego', 'Guerra', 'dguerragomez4@gmail.com', 'pbkdf2:sha256:260000$vwnbsHIhDLMx4oUC$88e471bfdea2639bf00054997e39ee12138bdd2cc08aaefd5c8572f60831e8d7', 'USUARIO', '2025-04-24', 'callé 56 f sur ', '3219527790', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alembic_version`
--
ALTER TABLE `alembic_version`
  ADD PRIMARY KEY (`version_num`);

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `detalle_carrito`
--
ALTER TABLE `detalle_carrito`
  ADD PRIMARY KEY (`carrito_id`,`juego_id`),
  ADD KEY `juego_id` (`juego_id`);

--
-- Indices de la tabla `detalle_factura`
--
ALTER TABLE `detalle_factura`
  ADD PRIMARY KEY (`factura_id`,`juego_id`),
  ADD KEY `juego_id` (`juego_id`);

--
-- Indices de la tabla `divisas`
--
ALTER TABLE `divisas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `divisa_id` (`divisa_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `juego`
--
ALTER TABLE `juego`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `juegos_promociones`
--
ALTER TABLE `juegos_promociones`
  ADD PRIMARY KEY (`juego_id`,`promocion_id`),
  ADD KEY `promocion_id` (`promocion_id`);

--
-- Indices de la tabla `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `promocion`
--
ALTER TABLE `promocion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id`),
  ADD KEY `juego_id` (`juego_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `divisas`
--
ALTER TABLE `divisas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `juego`
--
ALTER TABLE `juego`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `promocion`
--
ALTER TABLE `promocion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `detalle_carrito`
--
ALTER TABLE `detalle_carrito`
  ADD CONSTRAINT `detalle_carrito_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carrito` (`id`),
  ADD CONSTRAINT `detalle_carrito_ibfk_2` FOREIGN KEY (`juego_id`) REFERENCES `juego` (`id`);

--
-- Filtros para la tabla `detalle_factura`
--
ALTER TABLE `detalle_factura`
  ADD CONSTRAINT `detalle_factura_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`id`),
  ADD CONSTRAINT `detalle_factura_ibfk_2` FOREIGN KEY (`juego_id`) REFERENCES `juego` (`id`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`divisa_id`) REFERENCES `divisas` (`id`),
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `juego`
--
ALTER TABLE `juego`
  ADD CONSTRAINT `juego_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`);

--
-- Filtros para la tabla `juegos_promociones`
--
ALTER TABLE `juegos_promociones`
  ADD CONSTRAINT `juegos_promociones_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juego` (`id`),
  ADD CONSTRAINT `juegos_promociones_ibfk_2` FOREIGN KEY (`promocion_id`) REFERENCES `promocion` (`id`);

--
-- Filtros para la tabla `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `resena`
--
ALTER TABLE `resena`
  ADD CONSTRAINT `resena_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juego` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resena_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
