package com.druvio.app.search

import android.app.Activity
import android.content.Intent
import android.graphics.Color as AndroidColor
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.TrendingUp
import androidx.compose.material.icons.rounded.AccessTime
import androidx.compose.material.icons.rounded.AccountBalance
import androidx.compose.material.icons.rounded.AddHome
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.Business
import androidx.compose.material.icons.rounded.Cancel
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.CurrencyRupee
import androidx.compose.material.icons.rounded.Diamond
import androidx.compose.material.icons.rounded.Eco
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.GpsFixed
import androidx.compose.material.icons.rounded.HomeWork
import androidx.compose.material.icons.rounded.Landscape
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material.icons.rounded.Mic
import androidx.compose.material.icons.rounded.NewReleases
import androidx.compose.material.icons.rounded.Redeem
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Sell
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.SquareFoot
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.Verified
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

private val DeepGreen = Color(0xFF0B5D3B)
private val LightGreen = Color(0xFFE7F2EC)
private val Gold = Color(0xFFB88920)
private val LightGold = Color(0xFFF8EED5)
private val Canvas = Color(0xFFFAFAFA)
private val DarkCanvas = Color(0xFF101512)

data class SearchOption(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
)

data class SearchSuggestion(
    val title: String,
    val category: String,
    val icon: ImageVector,
)

private val popularSearches = listOf(
    SearchOption("Near Chakan MIDC", "Within 10 km", Icons.Rounded.LocationOn),
    SearchOption("Below ₹15 Lakh", "Budget", Icons.Rounded.CurrencyRupee),
    SearchOption("1000–1500 Sq.ft", "Plot Size", Icons.Rounded.SquareFoot),
    SearchOption("Investment Plots", "High Appreciation", Icons.AutoMirrored.Rounded.TrendingUp),
    SearchOption("Verified Projects", "Legal Clear", Icons.Rounded.Verified),
    SearchOption("Loan Available", "Bank Approved", Icons.Rounded.AccountBalance),
    SearchOption("Ready to Buy", "Immediate Possession", Icons.Rounded.Bolt),
    SearchOption("Highest Cashback", "1% Cashback", Icons.Rounded.Redeem),
)

private val allSuggestions = listOf(
    SearchSuggestion("Chakan MIDC, Pune", "Location", Icons.Rounded.LocationOn),
    SearchSuggestion("Talegaon Dabhade", "Location", Icons.Rounded.LocationOn),
    SearchSuggestion("Mumbai–Pune Expressway", "Landmark", Icons.Rounded.Explore),
    SearchSuggestion("Zinoo Green County", "Project", Icons.Rounded.HomeWork),
    SearchSuggestion("Kolte Patil Developers", "Developer", Icons.Rounded.Business),
    SearchSuggestion("Below ₹15 Lakh", "Budget", Icons.Rounded.CurrencyRupee),
    SearchSuggestion("1000–1500 Sq.ft", "Plot size", Icons.Rounded.SquareFoot),
)

class SearchDiscoveryActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = AndroidColor.TRANSPARENT
        WindowCompat.getInsetsController(window, window.decorView).isAppearanceLightStatusBars = true
        var voiceResultHandler: (String) -> Unit = {}
        val voiceSearchLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult(),
        ) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                result.data
                    ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                    ?.firstOrNull()
                    ?.let(voiceResultHandler)
            }
        }
        setContent {
            var voiceQuery by rememberSaveable { mutableStateOf("") }
            voiceResultHandler = { voiceQuery = it }
            ZinooTheme {
                SearchDiscoveryRoute(
                    initialQuery = voiceQuery,
                    onBack = onBackPressedDispatcher::onBackPressed,
                    onSearch = { query ->
                        // Connect this callback to the app's results route/Capacitor bridge.
                        setResult(
                            RESULT_OK,
                            Intent().putExtra(EXTRA_SEARCH_QUERY, query),
                        )
                        finish()
                    },
                    onVoiceSearch = {
                        voiceSearchLauncher.launch(
                            Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                                putExtra(
                                    RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM,
                                )
                                putExtra(RecognizerIntent.EXTRA_PROMPT, "Search Zinoo")
                            },
                        )
                    },
                )
            }
        }
    }

    companion object {
        const val EXTRA_SEARCH_QUERY = "search_query"
    }
}

@Composable
fun SearchDiscoveryRoute(
    initialQuery: String = "",
    onBack: () -> Unit,
    onSearch: (String) -> Unit,
    onVoiceSearch: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var query by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(initialQuery) {
        if (initialQuery.isNotBlank()) query = initialQuery
    }
    val recentSearches = remember {
        mutableStateListOf(
            "Near Chakan MIDC",
            "Below ₹18 Lakh",
            "1000 Sq.ft",
            "Verified Projects",
            "30 mins from Pune",
        )
    }
    val suggestions = remember(query) {
        if (query.isBlank()) emptyList() else allSuggestions.filter {
            it.title.contains(query, ignoreCase = true) ||
                it.category.contains(query, ignoreCase = true)
        }
    }

    SearchDiscoveryScreen(
        query = query,
        onQueryChange = { query = it },
        recentSearches = recentSearches,
        suggestions = suggestions,
        onBack = onBack,
        onVoiceSearch = onVoiceSearch,
        onSearch = { value ->
            val normalized = value.trim()
            if (normalized.isNotEmpty()) {
                recentSearches.remove(normalized)
                recentSearches.add(0, normalized)
                onSearch(normalized)
            }
        },
        onRemoveRecent = recentSearches::remove,
        onClearRecents = recentSearches::clear,
        modifier = modifier,
    )
}

@Composable
fun SearchDiscoveryScreen(
    query: String,
    onQueryChange: (String) -> Unit,
    recentSearches: List<String>,
    suggestions: List<SearchSuggestion>,
    onBack: () -> Unit,
    onVoiceSearch: () -> Unit,
    onSearch: (String) -> Unit,
    onRemoveRecent: (String) -> Unit,
    onClearRecents: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    Surface(modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(top = WindowInsets.statusBars.asPaddingValues().calculateTopPadding())
                .imePadding(),
        ) {
            SearchBar(
                query = query,
                onQueryChange = onQueryChange,
                onBack = onBack,
                onVoiceSearch = onVoiceSearch,
                onSearch = { onSearch(query) },
            )
            AnimatedContent(
                targetState = query.isBlank(),
                label = "discovery-to-suggestions",
            ) { showDiscovery ->
                if (showDiscovery) {
                    AnimatedVisibility(
                        visible = visible,
                        enter = fadeIn(tween(360)) +
                            slideInVertically(tween(420, easing = FastOutSlowInEasing)) { it / 8 },
                    ) {
                        DiscoveryContent(
                            recentSearches = recentSearches,
                            onSearch = onSearch,
                            onRemoveRecent = onRemoveRecent,
                            onClearRecents = onClearRecents,
                        )
                    }
                } else {
                    LiveSuggestions(
                        query = query,
                        suggestions = suggestions,
                        onSuggestionClick = onSearch,
                    )
                }
            }
        }
    }
}

@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onBack: () -> Unit,
    onVoiceSearch: () -> Unit,
    onSearch: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val focusRequester = remember { FocusRequester() }
    val focusManager = LocalFocusManager.current
    val keyboard = LocalSoftwareKeyboardController.current
    var focused by remember { mutableStateOf(false) }
    val horizontalPadding by animateDpAsState(
        targetValue = if (focused) 8.dp else 16.dp,
        animationSpec = tween(320, easing = FastOutSlowInEasing),
        label = "search-field-expansion",
    )

    LaunchedEffect(Unit) {
        delay(180)
        focusRequester.requestFocus()
    }

    Row(
        modifier
            .fillMaxWidth()
            .padding(start = 4.dp, end = horizontalPadding, top = 8.dp, bottom = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Rounded.ArrowBack, "Back")
        }
        Surface(
            modifier = Modifier
                .weight(1f)
                .height(56.dp),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
            shadowElevation = 1.dp,
        ) {
            Row(
                Modifier.padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    Icons.Rounded.Search,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                )
                Spacer(Modifier.width(12.dp))
                BasicTextField(
                    value = query,
                    onValueChange = onQueryChange,
                    modifier = Modifier
                        .weight(1f)
                        .focusRequester(focusRequester),
                    singleLine = true,
                    textStyle = TextStyle(
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = {
                        onSearch()
                        keyboard?.hide()
                        focusManager.clearFocus()
                    }),
                    decorationBox = { innerTextField ->
                        Box(contentAlignment = Alignment.CenterStart) {
                            if (query.isEmpty()) {
                                Text(
                                    "Search location, landmark, project...",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                            }
                            innerTextField()
                        }
                    },
                )
                if (query.isNotEmpty()) {
                    IconButton(onClick = { onQueryChange("") }, Modifier.size(40.dp)) {
                        Icon(Icons.Rounded.Cancel, "Clear search", Modifier.size(20.dp))
                    }
                } else {
                    IconButton(onClick = onVoiceSearch, Modifier.size(40.dp)) {
                        Icon(
                            Icons.Rounded.Mic,
                            "Voice search",
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DiscoveryContent(
    recentSearches: List<String>,
    onSearch: (String) -> Unit,
    onRemoveRecent: (String) -> Unit,
    onClearRecents: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            bottom = 24.dp + WindowInsets.navigationBars.asPaddingValues()
                .calculateBottomPadding(),
        ),
    ) {
        item { SectionTitle("Popular Searches") }
        item {
            PopularSearchGrid(
                searches = popularSearches,
                onSearchClick = { onSearch(it.title) },
            )
        }
        if (recentSearches.isNotEmpty()) {
            item {
                RecentSearchSection(
                    searches = recentSearches,
                    onSearchClick = onSearch,
                    onRemove = onRemoveRecent,
                    onClearAll = onClearRecents,
                )
            }
        }
        item {
            SuggestedSection(onSuggestionClick = { onSearch(it.title) })
        }
        item {
            Column(
                Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                QuickActionCard(
                    title = "Verified Plots Only",
                    subtitle = "100% Legal Clear",
                    icon = Icons.Rounded.Shield,
                    onClick = { onSearch("Verified Plots Only") },
                )
                QuickActionCard(
                    title = "1% Cashback",
                    subtitle = "On Every Booking",
                    icon = Icons.Rounded.Redeem,
                    useAccent = true,
                    onClick = { onSearch("1% Cashback") },
                )
            }
        }
    }
}

@Composable
fun PopularSearchGrid(
    searches: List<SearchOption>,
    onSearchClick: (SearchOption) -> Unit,
    modifier: Modifier = Modifier,
) {
    val rows = (searches.size + 1) / 2
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier
            .fillMaxWidth()
            .height((rows * 104).dp)
            .padding(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        userScrollEnabled = false,
    ) {
        items(searches, key = { it.title }) {
            PopularSearchCard(it, onClick = { onSearchClick(it) })
        }
    }
}

@Composable
fun PopularSearchCard(
    search: SearchOption,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick = onClick,
        modifier = modifier.height(92.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp, pressedElevation = 3.dp),
    ) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconBadge(search.icon)
                Spacer(Modifier.width(8.dp))
                Text(
                    search.title,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(
                search.subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
fun RecentSearchSection(
    searches: List<String>,
    onSearchClick: (String) -> Unit,
    onRemove: (String) -> Unit,
    onClearAll: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.padding(top = 16.dp)) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(start = 20.dp, end = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "Recent Searches",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            TextButton(onClick = onClearAll) {
                Text("Clear All", color = MaterialTheme.colorScheme.primary)
            }
        }
        LazyRow(
            contentPadding = PaddingValues(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(searches, key = { it }) { search ->
                AnimatedVisibility(
                    visible = true,
                    exit = fadeOut() + slideOutHorizontally { -it / 2 },
                ) {
                    SearchChip(
                        text = search,
                        onClick = { onSearchClick(search) },
                        onRemove = { onRemove(search) },
                    )
                }
            }
        }
    }
}

@Composable
fun SearchChip(
    text: String,
    onClick: () -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.height(42.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
    ) {
        Row(
            Modifier
                .clickable(onClick = onClick)
                .padding(start = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Rounded.AccessTime, null, Modifier.size(16.dp))
            Spacer(Modifier.width(8.dp))
            Text(text, style = MaterialTheme.typography.labelLarge)
            IconButton(onClick = onRemove, Modifier.size(38.dp)) {
                Icon(Icons.Rounded.Close, "Remove $text", Modifier.size(16.dp))
            }
        }
    }
}

private val suggestedSearches = listOf(
    SearchOption("Top Rated Projects", "Loved by verified buyers", Icons.Rounded.Star),
    SearchOption("Fastest Selling", "Plots moving this week", Icons.Rounded.Bolt),
    SearchOption("New Launches", "Fresh opportunities nearby", Icons.Rounded.NewReleases),
    SearchOption("Premium Projects", "Exceptional plotted living", Icons.Rounded.HomeWork),
    SearchOption("Best Value", "More land for your budget", Icons.Rounded.Diamond),
    SearchOption("Gated Communities", "Secure, planned communities", Icons.Rounded.Eco),
)

@Composable
fun SuggestedSection(
    onSuggestionClick: (SearchOption) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.padding(top = 20.dp)) {
        SectionTitle("Suggested by Zinoo")
        LazyRow(
            contentPadding = PaddingValues(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(suggestedSearches, key = { it.title }) {
                SuggestedCard(it, onClick = { onSuggestionClick(it) })
            }
        }
    }
}

@Composable
fun SuggestedCard(
    suggestion: SearchOption,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick = onClick,
        modifier = modifier
            .width(208.dp)
            .height(116.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(Modifier.padding(16.dp)) {
            IconBadge(suggestion.icon)
            Spacer(Modifier.height(10.dp))
            Text(
                suggestion.title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                suggestion.subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
fun QuickActionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    useAccent: Boolean = false,
) {
    val container = if (useAccent) LightGold else LightGreen
    val foreground = if (useAccent) Gold else DeepGreen
    Card(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(96.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (MaterialTheme.colorScheme.background == DarkCanvas) {
                MaterialTheme.colorScheme.surfaceVariant
            } else container
        ),
        elevation = CardDefaults.cardElevation(0.dp),
    ) {
        Row(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(foreground.copy(alpha = .12f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, null, Modifier.size(30.dp), tint = foreground)
            }
            Spacer(Modifier.width(16.dp))
            Column {
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun LiveSuggestions(
    query: String,
    suggestions: List<SearchSuggestion>,
    onSuggestionClick: (String) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
    ) {
        item {
            Text(
                if (suggestions.isEmpty()) "No suggestions yet" else "Suggestions",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 12.dp),
            )
        }
        itemsIndexed(suggestions, key = { _, it -> it.title }) { _, suggestion ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .clickable { onSuggestionClick(suggestion.title) }
                    .padding(vertical = 12.dp, horizontal = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconBadge(suggestion.icon)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(suggestion.title, fontWeight = FontWeight.SemiBold)
                    Text(
                        suggestion.category,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Icon(Icons.Rounded.Search, "Search ${suggestion.title}", Modifier.size(20.dp))
            }
        }
        if (suggestions.isEmpty()) {
            item {
                Text(
                    "Search for “$query”",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { onSuggestionClick(query) }
                        .padding(16.dp),
                )
            }
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text,
        modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 12.dp, bottom = 14.dp),
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
    )
}

@Composable
private fun IconBadge(icon: ImageVector) {
    Box(
        Modifier
            .size(32.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.primary.copy(alpha = .10f)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.primary)
    }
}

@Composable
fun ZinooTheme(
    darkTheme: Boolean = androidx.compose.foundation.isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colors = if (darkTheme) {
        darkColorScheme(
            primary = Color(0xFF80D5A7),
            secondary = Color(0xFFE4C46C),
            background = DarkCanvas,
            surface = Color(0xFF19201C),
            surfaceVariant = Color(0xFF253029),
        )
    } else {
        lightColorScheme(
            primary = DeepGreen,
            secondary = Gold,
            background = Canvas,
            surface = Color.White,
            surfaceVariant = Color(0xFFF0F2F0),
            onSurface = Color(0xFF172019),
            onSurfaceVariant = Color(0xFF667069),
        )
    }
    MaterialTheme(colorScheme = colors, content = content)
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
private fun SearchDiscoveryPreview() {
    ZinooTheme(darkTheme = false) {
        SearchDiscoveryScreen(
            query = "",
            onQueryChange = {},
            recentSearches = listOf(
                "Near Chakan MIDC",
                "Below ₹18 Lakh",
                "1000 Sq.ft",
            ),
            suggestions = emptyList(),
            onBack = {},
            onVoiceSearch = {},
            onSearch = {},
            onRemoveRecent = {},
            onClearRecents = {},
        )
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
private fun SearchDiscoveryDarkPreview() {
    ZinooTheme(darkTheme = true) {
        SearchDiscoveryScreen(
            query = "Chakan",
            onQueryChange = {},
            recentSearches = emptyList(),
            suggestions = allSuggestions.take(3),
            onBack = {},
            onVoiceSearch = {},
            onSearch = {},
            onRemoveRecent = {},
            onClearRecents = {},
        )
    }
}
