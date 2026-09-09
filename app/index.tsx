import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Heart,
  Home as HomeIcon,
  Mic,
  MonitorPlay,
  Play,
  Radio,
  Search,
  Tv,
  UserRound,
} from 'lucide-react-native';

type Screen = 'logo' | 'home' | 'discover1' | 'discover2' | 'discover3' | 'tv1' | 'tv2' | 'tv3' | 'tv4' | 'login';
type Tab = 'home' | 'search' | 'tv' | 'login';

const C = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#635A75',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  surface: '#FEF7FF',
  surfaceContainer: '#F3EDF7',
  surfaceContainerHigh: '#ECE6F0',
  surfaceContainerHighest: '#E6E0E9',
  onSurface: '#1D1B20',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  error: '#B3261E',
};

const discoverData = {
  discover1: ['Accion', 'Drama', 'Romanti', 'Fantasia', 'Animacion', 'Familia', 'Terror', 'Comedia', 'Misterio'],
  discover2: ['Pelicula 1', 'Pelicula 2', 'Pelicula 3', 'Pelicula 4', 'Pelicula 5', 'Pelicula 6', 'Pelicula 7', 'Pelicula 8', 'Pelicula 9'],
  discover3: ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 6', 'Serie 7', 'Serie 8', 'Serie 9'],
} as const;

const liveChannels = {
  tv3: ['Latina TV', 'America TV', 'Panamericana TV', 'Nacional', 'ATV', 'Canal 13'],
  tv4: ['RCN / Colombia', 'Caracol / Colombia', 'America / Argentina', 'TN', 'Ecuavisa / Ecuador', 'El Trece (13) Argentina', 'RCN Novelas'],
} as const;

export default function Index() {
  const [screen, setScreen] = useState<Screen>('logo');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const startX = useRef(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => setScreen('home'), 1300);
    return () => clearTimeout(timer);
  }, []);

  const goToTab = (tab: Tab) => {
    if (tab === 'home') setScreen('home');
    if (tab === 'search') setScreen('discover1');
    if (tab === 'tv') setScreen('tv1');
    if (tab === 'login') setScreen('login');
    setSearch('');
  };

  const toggleFavorite = (channel: string) => {
    setFavorites((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
  };

  const currentTab: Tab = screen.startsWith('discover') ? 'search' : screen.startsWith('tv') ? 'tv' : screen === 'login' ? 'login' : 'home';

  if (screen === 'logo') {
    return (
      <SafeAreaView style={styles.logoScreen} onTouchStart={(event) => { startX.current = event.nativeEvent.pageX; }} onTouchEnd={(event) => { if (event.nativeEvent.pageX - startX.current > 48) setScreen('tv4'); }}>
        <View style={styles.logoCenter}><Text style={styles.logoText}>Yerson TV</Text></View>
        <View style={styles.logoProgressTrack}><View style={styles.logoProgress} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {screen === 'home' && <HomeScreen width={width} search={search} setSearch={setSearch} onDiscover={() => setScreen('discover1')} onTv={() => setScreen('tv1')} />}
        {screen.startsWith('discover') && <DiscoverScreen variant={screen as 'discover1' | 'discover2' | 'discover3'} onChange={setScreen} />}
        {screen.startsWith('tv') && <TvScreen variant={screen as 'tv1' | 'tv2' | 'tv3' | 'tv4'} search={search} setSearch={setSearch} favorites={favorites} onFavorite={toggleFavorite} onChange={setScreen} />}
        {screen === 'login' && <LoginScreen username={username} password={password} setUsername={setUsername} setPassword={setPassword} signedIn={signedIn} onLogin={() => setSignedIn(true)} />}
      </View>
      <BottomNav active={currentTab} onChange={goToTab} />
    </SafeAreaView>
  );
}

function HomeScreen({ width, search, setSearch, onDiscover, onTv }: { width: number; search: string; setSearch: (value: string) => void; onDiscover: () => void; onTv: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHeader}><Text style={styles.homeLogo}>Yerson TV</Text></View>
      <Text style={styles.heroTitle}>PELICULAS, SERIES Y TV EN VIVO</Text>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search" trailing={<Mic size={20} color={C.onSurfaceVariant} />} />
      <View style={styles.sectionHeadingRow}><Text style={styles.sectionTitle}>Explorar categorias</Text><Text style={styles.sectionHint}>Todo en un solo lugar</Text></View>
      <SegmentedControl labels={['Peliculas', 'Series', 'TV']} active={0} onSelect={(index) => { if (index === 2) onTv(); if (index !== 2) onDiscover(); }} />
      <View style={styles.posterGrid}>
        {['Estrenos', 'Recomendado', 'En tendencia', 'Para compartir'].map((label) => <PosterCard key={label} label={label} />)}
      </View>
      <Pressable style={styles.exploreButton} onPress={onDiscover}><Text style={styles.exploreButtonText}>Descubrir contenido</Text></Pressable>
    </ScrollView>
  );
}

function DiscoverScreen({ variant, onChange }: { variant: 'discover1' | 'discover2' | 'discover3'; onChange: (screen: Screen) => void }) {
  const active = variant === 'discover1' ? 0 : variant === 'discover2' ? 1 : 2;
  const items = discoverData[variant];
  const labels = active === 0 ? ['Genero', 'Peliculas', 'Series'] : active === 1 ? ['Genero', 'Peliculas', 'Series'] : ['Genero', 'Peliculas', 'Series'];
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><Text style={styles.pageTitle}>Descubre</Text><IconButton icon={<Search size={19} color={C.onSecondaryContainer} />} /></View>
      <SegmentedControl labels={labels} active={active} onSelect={(index) => onChange(index === 0 ? 'discover1' : index === 1 ? 'discover2' : 'discover3')} />
      <Text style={styles.mutedLead}>{active === 0 ? 'Elige un género para empezar' : active === 1 ? 'Películas para cada momento' : 'Series que te van a atrapar'}</Text>
      <View style={styles.genreGrid}>
        {items.map((item, index) => <Pressable key={item} style={[styles.genreCard, index % 4 === 0 && styles.genreCardAccent]}><View style={styles.genreGlow} /><Text style={styles.genreText}>{item}</Text><Text style={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</Text></Pressable>)}
      </View>
    </ScrollView>
  );
}

function TvScreen({ variant, search, setSearch, favorites, onFavorite, onChange }: { variant: 'tv1' | 'tv2' | 'tv3' | 'tv4'; search: string; setSearch: (value: string) => void; favorites: string[]; onFavorite: (channel: string) => void; onChange: (screen: Screen) => void }) {
  const live = variant === 'tv1';
  const category = variant === 'tv2' ? 0 : variant === 'tv3' ? 1 : variant === 'tv4' ? 2 : -1;
  const channels = variant === 'tv3' ? liveChannels.tv3 : liveChannels.tv4;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}><Text style={styles.pageTitle}>Canales de TV</Text><View style={styles.topActions}><IconButton icon={<MonitorPlay size={19} color={C.onSecondaryContainer} />} /><IconButton icon={<Search size={19} color={C.onSecondaryContainer} />} /></View></View>
      <SegmentedControl labels={['Eventos', 'TV en vivo']} active={live ? 0 : 1} onSelect={(index) => onChange(index === 0 ? 'tv1' : 'tv2')} />
      {!live && <><SearchField value={search} onChangeText={setSearch} placeholder="Buscar canales" /><SegmentedControl labels={['Favoritos', 'Nacionales', 'Internacionales']} active={category} onSelect={(index) => onChange(index === 0 ? 'tv2' : index === 1 ? 'tv3' : 'tv4')} /></>}
      {live ? <LiveEvents /> : category === 0 ? <EmptyFavorites /> : <ChannelList channels={channels.filter((channel) => channel.toLowerCase().includes(search.toLowerCase()))} favorites={favorites} onFavorite={onFavorite} />}
    </ScrollView>
  );
}

function LiveEvents() {
  return <View style={styles.eventsWrap}>{[['Serie 1', '12:00pm'], ['Serie 2', '5:30pm']].map(([title, time]) => <View key={title} style={styles.eventCard}><View style={styles.eventTop}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.eventTime}>{time}</Text></View><View style={styles.matchRow}><Text style={styles.teamText}>Equipo 1</Text><Text style={styles.vsText}>vs</Text><Text style={styles.teamText}>Equipo 2</Text></View><Pressable style={styles.watchButton}><Play size={15} color={C.onPrimary} fill={C.onPrimary} /><Text style={styles.watchText}>Ver</Text></Pressable></View>)}</View>;
}

function EmptyFavorites() {
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><Tv size={28} color={C.primary} /></View><Text style={styles.emptyTitle}>Favoritos</Text><Text style={styles.emptyText}>Aún no agregaste canales</Text><Text style={styles.emptyHint}>Guarda tus canales preferidos para encontrarlos aquí.</Text></View>;
}

function ChannelList({ channels, favorites, onFavorite }: { channels: readonly string[]; favorites: string[]; onFavorite: (channel: string) => void }) {
  return <View style={styles.channelList}><View style={styles.listHeader}><Text style={styles.sectionTitle}>Canales disponibles</Text><Text style={styles.channelCount}>{channels.length} canales</Text></View>{channels.map((channel) => { const active = favorites.includes(channel); return <View style={styles.channelRow} key={channel}><View style={styles.channelBadge}><Radio size={17} color={C.primary} /></View><Text style={styles.channelName}>{channel}</Text><Pressable style={styles.favoriteButton} onPress={() => onFavorite(channel)}><Heart size={20} color={active ? C.primary : C.onSurfaceVariant} fill={active ? C.primary : 'transparent'} /></Pressable></View>; })}</View>;
}

function LoginScreen({ username, password, setUsername, setPassword, signedIn, onLogin }: { username: string; password: string; setUsername: (value: string) => void; setPassword: (value: string) => void; signedIn: boolean; onLogin: () => void }) {
  return <ScrollView contentContainerStyle={[styles.scrollContent, styles.loginContent]}><View style={styles.loginMark}><UserRound size={24} color={C.primary} /></View><Text style={styles.loginTitle}>Inicio de sesión</Text><Text style={styles.loginSubtitle}>{signedIn ? `Hola, ${username || 'usuario'}` : 'Accede para guardar tus favoritos'}</Text>{signedIn ? <View style={styles.signedCard}><Text style={styles.signedTitle}>Sesión iniciada</Text><Text style={styles.signedText}>Ya puedes disfrutar de tu contenido y canales guardados.</Text></View> : <><TextInput value={username} onChangeText={setUsername} placeholder="Usuario" placeholderTextColor={C.outline} style={styles.input} autoCapitalize="none" /><TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor={C.outline} style={styles.input} secureTextEntry /><Pressable style={styles.loginButton} onPress={onLogin}><Text style={styles.loginButtonText}>Ingresar</Text></Pressable><Text style={styles.loginFootnote}>Al continuar aceptas nuestros términos de uso.</Text></>}</ScrollView>;
}

function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const items: { key: Tab; label: string; icon: typeof HomeIcon }[] = [{ key: 'home', label: 'Home', icon: HomeIcon }, { key: 'search', label: 'Buscar', icon: Search }, { key: 'tv', label: 'TV', icon: Tv }, { key: 'login', label: 'Cuenta', icon: UserRound }];
  return <View style={styles.bottomNav}>{items.map(({ key, label, icon: Icon }) => { const selected = active === key; return <Pressable key={key} style={styles.navItem} onPress={() => onChange(key)}><View style={[styles.navPill, selected && styles.navPillActive]}><Icon size={21} color={selected ? C.primary : C.onSurfaceVariant} fill={selected && key !== 'search' ? C.primary : 'transparent'} /></View><Text style={[styles.navLabel, selected && styles.navLabelActive]}>{label}</Text></Pressable>; })}</View>;
}

function SearchField({ value, onChangeText, placeholder, trailing }: { value: string; onChangeText: (value: string) => void; placeholder: string; trailing?: React.ReactNode }) {
  return <View style={styles.searchField}><Search size={20} color={C.onSurfaceVariant} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.onSurfaceVariant} style={styles.searchInput} /><View>{trailing}</View></View>;
}

function SegmentedControl({ labels, active, onSelect }: { labels: string[]; active: number; onSelect: (index: number) => void }) {
  return <View style={styles.segmented}>{labels.map((label, index) => <Pressable key={label} onPress={() => onSelect(index)} style={[styles.segment, index === active ? styles.segmentActive : styles.segmentInactive, index === 0 && styles.segmentFirst, index === labels.length - 1 && styles.segmentLast]}><Text style={[styles.segmentText, index === active && styles.segmentTextActive]}>{label}</Text></Pressable>)}</View>;
}

function IconButton({ icon }: { icon: React.ReactNode }) { return <Pressable style={styles.iconButton}>{icon}</Pressable>; }
function PosterCard({ label }: { label: string }) { return <Pressable style={styles.posterCard}><View style={styles.posterArt}><MonitorPlay size={26} color={C.outline} /></View><Text style={styles.posterLabel}>{label}</Text><Text style={styles.posterMeta}>Yerson selection</Text></Pressable>; }

const styles = StyleSheet.create({
  logoScreen: { flex: 1, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  logoCenter: { flex: 1, justifyContent: 'center' },
  logoText: { color: C.onPrimary, fontSize: 45, fontWeight: '700', letterSpacing: -1.5 },
  logoProgressTrack: { width: '72%', height: 4, backgroundColor: C.primaryContainer, borderRadius: 4, marginBottom: 48, overflow: 'hidden' },
  logoProgress: { width: '46%', height: 4, backgroundColor: C.onPrimary, borderRadius: 4 },
  screen: { flex: 1, backgroundColor: C.surface },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28, gap: 16 },
  homeHeader: { width: 160, height: 72, backgroundColor: C.primary, borderRadius: 28, justifyContent: 'center', paddingHorizontal: 20 },
  homeLogo: { color: C.onPrimary, fontSize: 25, fontWeight: '700', letterSpacing: -0.7 },
  heroTitle: { color: C.onSurface, fontSize: 21, lineHeight: 28, fontWeight: '700', textAlign: 'center', marginTop: -2 },
  searchField: { height: 56, borderRadius: 28, backgroundColor: C.surfaceContainerHigh, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 10 },
  searchInput: { flex: 1, color: C.onSurface, fontSize: 16, paddingVertical: 0 },
  sectionHeadingRow: { gap: 3, marginTop: 4 },
  sectionTitle: { color: C.onSurface, fontSize: 23, fontWeight: '700' },
  sectionHint: { color: C.onSurfaceVariant, fontSize: 14 },
  segmented: { flexDirection: 'row', alignSelf: 'center', gap: 3 },
  segment: { minHeight: 42, paddingHorizontal: 18, justifyContent: 'center' },
  segmentFirst: { borderTopLeftRadius: 22, borderBottomLeftRadius: 22 },
  segmentLast: { borderTopRightRadius: 22, borderBottomRightRadius: 22 },
  segmentActive: { backgroundColor: C.primary },
  segmentInactive: { backgroundColor: C.secondaryContainer },
  segmentText: { color: C.onSecondaryContainer, fontSize: 13, fontWeight: '600' },
  segmentTextActive: { color: C.onPrimary },
  posterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  posterCard: { width: '48.6%', minHeight: 176, backgroundColor: C.surfaceContainer, borderRadius: 20, padding: 8 },
  posterArt: { flex: 1, minHeight: 120, borderRadius: 16, backgroundColor: C.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  posterLabel: { color: C.onSurface, fontSize: 15, fontWeight: '700', marginTop: 8 },
  posterMeta: { color: C.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  exploreButton: { height: 52, borderRadius: 26, backgroundColor: C.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  exploreButtonText: { color: C.onPrimaryContainer, fontWeight: '700', fontSize: 15 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { color: C.onSurface, fontSize: 30, lineHeight: 38, fontWeight: '700', letterSpacing: -0.8 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  mutedLead: { color: C.onSurfaceVariant, fontSize: 15, marginTop: 2 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreCard: { width: '31.8%', height: 144, borderRadius: 22, backgroundColor: C.surfaceContainerHigh, overflow: 'hidden', justifyContent: 'flex-end', padding: 12 },
  genreCardAccent: { backgroundColor: C.primaryContainer },
  genreGlow: { position: 'absolute', width: 80, height: 80, borderRadius: 40, right: -22, top: -22, backgroundColor: 'rgba(255,255,255,0.38)' },
  genreText: { color: C.onSurface, fontSize: 17, lineHeight: 21, fontWeight: '700' },
  cardNumber: { color: C.onSurfaceVariant, fontSize: 11, marginTop: 5, fontWeight: '700' },
  eventsWrap: { gap: 12, marginTop: 2 },
  eventCard: { minHeight: 226, backgroundColor: C.surfaceContainerHigh, borderRadius: 24, padding: 18, justifyContent: 'space-between' },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: C.onSurface, fontSize: 21, fontWeight: '700' },
  eventTime: { color: C.onSurfaceVariant, fontSize: 16, fontWeight: '600' },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  teamText: { color: C.onSurface, fontSize: 18, fontWeight: '600' },
  vsText: { color: C.primary, fontSize: 20, fontWeight: '800' },
  watchButton: { width: 92, height: 42, borderRadius: 21, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  watchText: { color: C.onPrimary, fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 68, paddingHorizontal: 20 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: C.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { color: C.onSurface, fontSize: 28, fontWeight: '700' },
  emptyText: { color: C.onSurfaceVariant, fontSize: 16, marginTop: 8 },
  emptyHint: { color: C.onSurfaceVariant, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  channelList: { gap: 7 },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2, marginBottom: 3 },
  channelCount: { color: C.onSurfaceVariant, fontSize: 14 },
  channelRow: { minHeight: 60, backgroundColor: C.surfaceContainer, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12 },
  channelBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  channelName: { flex: 1, color: C.onSurface, fontSize: 16, fontWeight: '600' },
  favoriteButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  loginContent: { justifyContent: 'center', paddingBottom: 50 },
  loginMark: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.primaryContainer, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 18 },
  loginTitle: { color: C.onSurface, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  loginSubtitle: { color: C.onSurfaceVariant, fontSize: 15, textAlign: 'center', marginTop: 7, marginBottom: 18 },
  input: { height: 56, borderRadius: 16, borderWidth: 1, borderColor: C.outline, paddingHorizontal: 16, color: C.onSurface, fontSize: 16, backgroundColor: C.surface },
  loginButton: { height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  loginButtonText: { color: C.onPrimary, fontSize: 15, fontWeight: '700' },
  loginFootnote: { color: C.onSurfaceVariant, fontSize: 12, textAlign: 'center', marginTop: 5 },
  signedCard: { backgroundColor: C.primaryContainer, borderRadius: 20, padding: 20, marginTop: 6 },
  signedTitle: { color: C.onPrimaryContainer, fontSize: 19, fontWeight: '700' },
  signedText: { color: C.onPrimaryContainer, fontSize: 14, lineHeight: 21, marginTop: 7 },
  bottomNav: { height: 82, backgroundColor: C.surfaceContainer, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 9, paddingBottom: 5 },
  navItem: { alignItems: 'center', justifyContent: 'flex-start', minWidth: 64 },
  navPill: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navPillActive: { backgroundColor: C.secondaryContainer },
  navLabel: { color: C.onSurfaceVariant, fontSize: 11, marginTop: 3 },
  navLabelActive: { color: C.onSurface, fontWeight: '700' },
});
