const recipes = [
    {
        id: "crane-classic",
        name: "Classic Crane",
        difficulty: "Beginner",
        type: "Animal",
        paper: "15cm square",
        time: "10 min",
        steps: [
            "Start with colored side down and fold diagonally both ways.",
            "Turn over and fold horizontally and vertically.",
            "Collapse into a square base.",
            "Fold lower edges to center on both sides and unfold.",
            "Lift top flap and squash fold into a bird base.",
            "Repeat squash fold on the back side.",
            "Fold side flaps to center to shape neck and tail.",
            "Inside reverse fold one flap up for neck and another for tail.",
            "Inside reverse fold tip of neck to form head.",
            "Pull wings down gently and inflate body."
        ]
    },
    {
        id: "jumping-frog",
        name: "Jumping Frog",
        difficulty: "Beginner",
        type: "Toy",
        paper: "10cm square",
        time: "8 min",
        steps: [
            "Fold square in half and unfold.",
            "Fold top corners to center crease to form a triangle top.",
            "Fold top triangle down then unfold.",
            "Collapse top area into a waterbomb-like flap.",
            "Fold side edges of lower rectangle inward.",
            "Fold bottom up to meet triangle base.",
            "Fold in half backward.",
            "Create spring legs by folding back a small strip.",
            "Press rear and release to make frog jump."
        ]
    },
    {
        id: "tulip-cup",
        name: "Tulip Cup",
        difficulty: "Beginner",
        type: "Flower",
        paper: "15cm square",
        time: "9 min",
        steps: [
            "Fold diagonally to make a triangle.",
            "Bring left corner up to top point.",
            "Bring right corner up to top point.",
            "Fold small top flaps down to lock.",
            "Open central pocket carefully.",
            "Inflate base by blowing gently into hole.",
            "Shape petals by folding tips outward.",
            "Set on table as decorative cup."
        ]
    },
    {
        id: "lotus-flower",
        name: "Lotus Flower",
        difficulty: "Intermediate",
        type: "Flower",
        paper: "15cm square",
        time: "15 min",
        steps: [
            "Fold all four corners to center.",
            "Turn model over and fold all corners to center again.",
            "Repeat once more for tighter layers.",
            "Hold center firmly and pull first layer petals outward from underneath.",
            "Repeat around all four sides.",
            "Pull second layer petals out.",
            "Adjust symmetry and curl tips slightly."
        ]
    },
    {
        id: "koi-fish",
        name: "Koi Fish",
        difficulty: "Intermediate",
        type: "Animal",
        paper: "20cm square",
        time: "14 min",
        steps: [
            "Fold square diagonally and unfold.",
            "Fold side edges to center crease as a kite.",
            "Fold top tip down and unfold to mark line.",
            "Open upper layers and squash fold.",
            "Fold tail section in half and reverse fold tip.",
            "Shape fin flaps outward.",
            "Curve body lightly for swimming look."
        ]
    },
    {
        id: "fox-mask",
        name: "Fox Mask",
        difficulty: "Beginner",
        type: "Seasonal",
        paper: "24cm square",
        time: "7 min",
        steps: [
            "Fold square diagonally into a triangle.",
            "Fold left and right corners up to create ears.",
            "Fold top point down slightly between ears.",
            "Fold bottom point up for snout area.",
            "Fold small side tips backward for shape.",
            "Draw eyes and nose with marker.",
            "Use tape and string to wear as mask."
        ]
    },
    {
        id: "samurai-helmet",
        name: "Samurai Helmet",
        difficulty: "Beginner",
        type: "Seasonal",
        paper: "newspaper sheet",
        time: "6 min",
        steps: [
            "Fold rectangle in half top to bottom.",
            "Fold top corners to center.",
            "Fold bottom front flap up.",
            "Turn over and fold second flap up.",
            "Tuck corners inside and open from bottom.",
            "Shape and wear the helmet."
        ]
    },
    {
        id: "butterfly-flap",
        name: "Flapping Butterfly",
        difficulty: "Intermediate",
        type: "Animal",
        paper: "15cm square",
        time: "12 min",
        steps: [
            "Fold diagonally both directions and unfold.",
            "Fold in half horizontally and vertically then collapse into triangle base.",
            "Fold top layer corners up to top point.",
            "Turn over and fold top point down past edge.",
            "Fold model in half vertically.",
            "Fold wings downward at angle.",
            "Pull wings gently to make them flap."
        ]
    },
    {
        id: "modular-star",
        name: "Modular Lucky Star",
        difficulty: "Beginner",
        type: "Decor",
        paper: "paper strip",
        time: "4 min",
        steps: [
            "Tie a loose knot near one end of strip.",
            "Flatten knot into pentagon shape.",
            "Wrap long tail around pentagon edges repeatedly.",
            "Tuck end inside pocket.",
            "Pinch all five sides to puff the star."
        ]
    },
    {
        id: "sonobe-cube",
        name: "Sonobe Cube",
        difficulty: "Advanced",
        type: "Decor",
        paper: "6 squares",
        time: "22 min",
        steps: [
            "Create six Sonobe units from square papers.",
            "For each unit fold in half and unfold.",
            "Fold edges to center then fold diagonals at corners.",
            "Refold into parallelogram unit with two pockets and two tabs.",
            "Insert tabs of one unit into pockets of another.",
            "Continue assembling three units for a corner.",
            "Add remaining units and close final face carefully."
        ]
    },
    {
        id: "dragon-simple",
        name: "Simple Dragon",
        difficulty: "Advanced",
        type: "Animal",
        paper: "20cm square",
        time: "25 min",
        steps: [
            "Start from bird base.",
            "Narrow neck and tail with petal folds.",
            "Inside reverse fold neck forward and tail backward.",
            "Create head by folding tip down and opening jaw fold.",
            "Fold wings out wide from body.",
            "Add small mountain folds along wings for texture.",
            "Curl tail and adjust stance."
        ]
    },
    {
        id: "heart-pocket",
        name: "Pocket Heart",
        difficulty: "Beginner",
        type: "Useful",
        paper: "15cm square",
        time: "8 min",
        steps: [
            "Fold square in half to form rectangle.",
            "Fold top corners inward to center.",
            "Fold side edges to center line.",
            "Round top by folding tiny corners down.",
            "Fold bottom point up behind model.",
            "Open rear flap to form a tiny pocket."
        ]
    },
    {
        id: "bookmark-corner",
        name: "Corner Bookmark",
        difficulty: "Beginner",
        type: "Useful",
        paper: "12cm square",
        time: "5 min",
        steps: [
            "Fold square diagonally to triangle.",
            "Fold top layer tip to bottom edge center.",
            "Fold left and right corners up to top.",
            "Tuck those corners into front pocket.",
            "Decorate with face or pattern."
        ]
    },
    {
        id: "envelope-classic",
        name: "Classic Letter Envelope",
        difficulty: "Beginner",
        type: "Useful",
        paper: "A4 cut square",
        time: "7 min",
        steps: [
            "Fold square in half diagonally.",
            "Fold left and right corners to center point.",
            "Fold bottom corner upward past center.",
            "Fold top corner down to close.",
            "Tuck small flap for lock."
        ]
    },
    {
        id: "lily-bloom",
        name: "Lily Bloom",
        difficulty: "Intermediate",
        type: "Flower",
        paper: "15cm square",
        time: "16 min",
        steps: [
            "Make a square base from diagonal and straight creases.",
            "Perform petal fold on one side.",
            "Repeat petal fold on all four sides.",
            "Fold side flaps inward to slim petals.",
            "Pull petals outward from top.",
            "Curl petal tips with pencil."
        ]
    },
    {
        id: "windmill-spinner",
        name: "Paper Windmill",
        difficulty: "Intermediate",
        type: "Toy",
        paper: "15cm square",
        time: "12 min",
        steps: [
            "Fold square diagonally both directions.",
            "Cut small slits from corners toward center stopping short.",
            "Bring every other tip to center.",
            "Pin center with push pin to straw.",
            "Spin in light breeze."
        ]
    },
    {
        id: "snapper-toy",
        name: "Paper Snapper",
        difficulty: "Beginner",
        type: "Toy",
        paper: "A4 sheet",
        time: "6 min",
        steps: [
            "Fold rectangle in half lengthwise.",
            "Fold corners to center to make pointed shape.",
            "Fold in half and then in half again.",
            "Hold with open side facing down.",
            "Snap wrist downward to make popping sound."
        ]
    },
    {
        id: "swan-elegant",
        name: "Elegant Swan",
        difficulty: "Intermediate",
        type: "Animal",
        paper: "20cm square",
        time: "13 min",
        steps: [
            "Fold square diagonally and unfold.",
            "Fold both sides to center creating a kite.",
            "Fold kite in half lengthwise.",
            "Inside reverse fold top point up for neck.",
            "Inside reverse fold tip for head.",
            "Curve neck and spread body base."
        ]
    },
    {
        id: "penguin-cute",
        name: "Cute Penguin",
        difficulty: "Beginner",
        type: "Animal",
        paper: "15cm square",
        time: "9 min",
        steps: [
            "Use one side black and one side white paper.",
            "Fold diagonal triangle with white side inside.",
            "Fold top point down for head.",
            "Fold side points inward as wings.",
            "Fold bottom tip up for belly.",
            "Draw eyes and beak."
        ]
    },
    {
        id: "rabbit-hop",
        name: "Hopping Rabbit",
        difficulty: "Intermediate",
        type: "Animal",
        paper: "15cm square",
        time: "11 min",
        steps: [
            "Fold and collapse into fish base.",
            "Fold side flaps to form long ears.",
            "Reverse fold front for nose.",
            "Create rear spring fold at bottom.",
            "Press and release back to hop."
        ]
    },
    {
        id: "pinwheel-rosette",
        name: "Pinwheel Rosette",
        difficulty: "Intermediate",
        type: "Decor",
        paper: "20cm square",
        time: "14 min",
        steps: [
            "Fold square into 16-grid using quarter folds.",
            "Collapse pleats into spinning pinwheel shape.",
            "Lock center with tuck fold.",
            "Twist gently to open layered rosette.",
            "Mount on card for decoration."
        ]
    },
    {
        id: "lantern-mini",
        name: "Mini Lantern",
        difficulty: "Advanced",
        type: "Decor",
        paper: "2 squares",
        time: "20 min",
        steps: [
            "Create two identical box-like modules.",
            "Fold each into shallow open cube.",
            "Slot edges together to form lantern body.",
            "Add folded strip as top handle.",
            "Place LED tea light inside."
        ]
    },
    {
        id: "gift-box-lid",
        name: "Gift Box with Lid",
        difficulty: "Intermediate",
        type: "Useful",
        paper: "2 squares",
        time: "18 min",
        steps: [
            "Use slightly larger square for lid and smaller for base.",
            "Fold each square into thirds both directions.",
            "Create corner walls with squash folds.",
            "Lock side flaps to build box shape.",
            "Repeat for second piece and fit lid over base."
        ]
    },
    {
        id: "christmas-tree",
        name: "Holiday Tree",
        difficulty: "Intermediate",
        type: "Seasonal",
        paper: "15cm square",
        time: "12 min",
        steps: [
            "Fold into kite then narrow body with additional folds.",
            "Make layered branch cuts and fold points down.",
            "Fold trunk section up from bottom.",
            "Stand model and decorate with pen dots."
        ]
    },
    {
        id: "bat-night",
        name: "Night Bat",
        difficulty: "Beginner",
        type: "Seasonal",
        paper: "15cm square",
        time: "7 min",
        steps: [
            "Fold diagonal triangle.",
            "Fold top point down for head.",
            "Fold side points out wide for wings.",
            "Fold tiny ear points up.",
            "Draw eyes for final look."
        ]
    },
    {
        id: "paper-boat",
        name: "Classic Boat",
        difficulty: "Beginner",
        type: "Toy",
        paper: "A4 sheet",
        time: "5 min",
        steps: [
            "Fold paper in half.",
            "Fold top corners to center.",
            "Fold bottom flaps up on both sides.",
            "Open into square shape.",
            "Fold bottom corner up on each side.",
            "Open again and pull top corners apart to form boat."
        ]
    }
];

const elements = {
    searchInput: document.getElementById("searchInput"),
    difficultyFilter: document.getElementById("difficultyFilter"),
    typeFilter: document.getElementById("typeFilter"),
    recipeList: document.getElementById("recipeList"),
    recipeDetail: document.getElementById("recipeDetail"),
    totalCount: document.getElementById("totalCount"),
    shownCount: document.getElementById("shownCount"),
    selectedName: document.getElementById("selectedName")
};

let currentSelection = recipes[0]?.id || null;

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getFilteredRecipes() {
    const search = elements.searchInput.value.trim().toLowerCase();
    const difficulty = elements.difficultyFilter.value;
    const type = elements.typeFilter.value;

    return recipes.filter((recipe) => {
        const matchSearch =
            !search ||
            recipe.name.toLowerCase().includes(search) ||
            recipe.type.toLowerCase().includes(search) ||
            recipe.steps.some((step) => step.toLowerCase().includes(search));

        const matchDifficulty = difficulty === "all" || recipe.difficulty === difficulty;
        const matchType = type === "all" || recipe.type === type;

        return matchSearch && matchDifficulty && matchType;
    });
}

function renderRecipeList(filteredRecipes) {
    if (filteredRecipes.length === 0) {
        elements.recipeList.innerHTML = `
            <div class="empty-state">
                <h3>No recipes found</h3>
                <p>Try a different keyword or clear one of the filters.</p>
            </div>
        `;
        return;
    }

    const listHtml = filteredRecipes
        .map((recipe) => {
            const activeClass = recipe.id === currentSelection ? "active" : "";
            const difficultyClass = recipe.difficulty.toLowerCase();

            return `
                <button class="recipe-button ${activeClass}" data-id="${recipe.id}">
                    <div class="recipe-title-row">
                        <h3>${escapeHtml(recipe.name)}</h3>
                        <span class="pill ${difficultyClass}">${escapeHtml(recipe.difficulty)}</span>
                    </div>
                    <div class="recipe-meta">
                        <span>${escapeHtml(recipe.type)}</span>
                        <span>${escapeHtml(recipe.time)}</span>
                    </div>
                </button>
            `;
        })
        .join("");

    elements.recipeList.innerHTML = listHtml;

    elements.recipeList.querySelectorAll(".recipe-button").forEach((button) => {
        button.addEventListener("click", () => {
            currentSelection = button.dataset.id;
            render();
        });
    });
}

function renderRecipeDetail(filteredRecipes) {
    const fallbackRecipe = filteredRecipes[0] || null;
    const selectedRecipe =
        filteredRecipes.find((recipe) => recipe.id === currentSelection) || fallbackRecipe;

    if (!selectedRecipe) {
        elements.recipeDetail.innerHTML = `
            <div class="empty-state">
                <h2>No recipe selected</h2>
                <p>Update your filters to bring recipes back.</p>
            </div>
        `;
        elements.selectedName.textContent = "None";
        return;
    }

    currentSelection = selectedRecipe.id;
    elements.selectedName.textContent = selectedRecipe.name;

    const stepsHtml = selectedRecipe.steps
        .map((step) => `<li>${escapeHtml(step)}</li>`)
        .join("");

    elements.recipeDetail.innerHTML = `
        <div class="detail-header">
            <h2>${escapeHtml(selectedRecipe.name)}</h2>
            <div class="detail-tags">
                <span class="detail-chip">Level: ${escapeHtml(selectedRecipe.difficulty)}</span>
                <span class="detail-chip">Type: ${escapeHtml(selectedRecipe.type)}</span>
                <span class="detail-chip">Paper: ${escapeHtml(selectedRecipe.paper)}</span>
                <span class="detail-chip">Time: ${escapeHtml(selectedRecipe.time)}</span>
            </div>
            <p>Follow these steps in order and keep your folds crisp for best results.</p>
        </div>
        <ol class="instructions">${stepsHtml}</ol>
    `;
}

function updateStats(filteredRecipes) {
    elements.totalCount.textContent = String(recipes.length);
    elements.shownCount.textContent = String(filteredRecipes.length);
}

function render() {
    const filteredRecipes = getFilteredRecipes();
    updateStats(filteredRecipes);
    renderRecipeList(filteredRecipes);
    renderRecipeDetail(filteredRecipes);
}

["input", "change"].forEach((eventName) => {
    elements.searchInput.addEventListener(eventName, render);
    elements.difficultyFilter.addEventListener(eventName, render);
    elements.typeFilter.addEventListener(eventName, render);
});

render();
