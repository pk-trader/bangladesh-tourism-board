// Updated Live Google Maps Driving Navigation Function with Auto Current Location
function openGoogleMapsNav(destinationName, district) {
    const destination = encodeURIComponent(`${destinationName}, ${district}, Bangladesh`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${destination}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    if (menu && icon) {
        menu.classList.toggle('hidden');
        icon.className = menu.classList.contains('hidden') ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
    }
}

let currentSlideIndex = 0;
let slideTimer = null;
const SLIDE_INTERVAL = 7000;
const defaultSliders = [
    { title: "BEAUTIFUL BANGLADESH", sub: "Land of Greenery, Rivers & Endless Heritage", video: "videos/bangladesh.mp4" },
    { title: "COX'S BAZAR", sub: "World's Longest Unbroken Natural Sandy Sea Beach", video: "videos/cox's_bajar.mp4" },
    { title: "SAJEK VALLEY", sub: "Kingdom of Clouds in Hill Tracts", video: "videos/sajek.mp4" },
    { title: "THE SUNDARBANS", sub: "Largest Mangrove Forest & Home of Royal Bengal Tiger", video: "videos/sundarbans.mp4" }
];

function getHeroSlides() {
    const stored = localStorage.getItem('btb_sliders');
    return (stored && JSON.parse(stored).length > 0) ? JSON.parse(stored) : defaultSliders;
}

function renderSlide(index) {
    const slides = getHeroSlides();
    currentSlideIndex = (index < 0) ? slides.length - 1 : (index >= slides.length ? 0 : index);
    const slide = slides[currentSlideIndex];
    const video = document.getElementById('heroVideo');
    const videoSrc = document.getElementById('videoSource');
    const titleEl = document.getElementById('heroTitle');
    const subEl = document.getElementById('heroSub');

    if (!video || !videoSrc) return;
    video.classList.add('opacity-0');
    setTimeout(() => {
        videoSrc.src = slide.video;
        video.load();
        video.play().catch(e => console.log("Autoplay blocked:", e));
        titleEl.innerHTML = slide.title.toUpperCase().includes("BANGLADESH") ? 
            `<span class="text-amber-400">BANGLA</span><span class="text-emerald-400">DESH</span>` : slide.title;
        subEl.textContent = slide.sub;
        video.classList.remove('opacity-0');
    }, 300);
    updateDots(slides.length);
}

function updateDots(total) {
    const container = document.getElementById('dotsContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentSlideIndex ? 'bg-emerald-400 w-8' : 'bg-slate-500/60 hover:bg-slate-400'}`;
        dot.onclick = () => { renderSlide(i); resetTimer(); };
        container.appendChild(dot);
    }
}

function nextSlide() { renderSlide(currentSlideIndex + 1); resetTimer(); }
function prevSlide() { renderSlide(currentSlideIndex - 1); resetTimer(); }
function startTimer() { slideTimer = setInterval(() => renderSlide(currentSlideIndex + 1), SLIDE_INTERVAL); }
function resetTimer() { clearInterval(slideTimer); startTimer(); }

// Render Notices Live from Firebase Firestore
function renderNotices() {
    const container = document.getElementById('noticeListContainer');
    if (!container) return;

    if (typeof db === 'undefined') {
        container.innerHTML = `<p class="text-xs text-slate-400">Firebase database not initialized.</p>`;
        return;
    }

    db.collection('notices').onSnapshot((snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = `<p class="text-xs text-slate-400">No active notices published yet.</p>`;
            return;
        }

        let noticesHtml = '';
        snapshot.forEach((doc) => {
            const n = doc.data();
            const docId = doc.id;
            noticesHtml += `
                <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <span class="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded uppercase">${n.category || 'General'}</span>
                        <h4 class="text-sm font-bold text-white mt-1">${n.title || ''}</h4>
                        <span class="text-[10px] text-slate-400">Published: ${n.date || ''}</span>
                    </div>
                    ${n.file ? `<button onclick="openNoticeModal('${n.file}', '${n.title}')" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition">View Document</button>` : ''}
                </div>
            `;
        });
        container.innerHTML = noticesHtml;
    }, (error) => {
        console.error("Error fetching notices: ", error);
        container.innerHTML = `<p class="text-xs text-bdRed">Failed to load live notices.</p>`;
    });
}

function renderDestinations(category = 'all') {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;
    
    const destinations = JSON.parse(localStorage.getItem('btb_destinations')) || [];
    const filtered = category === 'all' ? destinations : destinations.filter(d => d.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-3 text-center py-10">No destinations found in this category.</p>`;
    } else {
        grid.innerHTML = filtered.map(d => `
            <div onclick="openDestModalById(${d.id})" class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:border-emerald-500/50 transition group">
                <div class="h-48 overflow-hidden relative">
                    <img src="${d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${d.name}">
                    <span class="absolute top-3 left-3 px-2.5 py-1 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold rounded-lg uppercase border border-emerald-800/40">${d.category}</span>
                </div>
                <div class="p-5 space-y-2">
                    <div class="flex justify-between items-center text-xs text-slate-400">
                        <span><i class="fa-solid fa-location-dot text-bdRed mr-1"></i> ${d.district}</span>
                        <span class="text-yellow-400 font-bold font-mono">${d.hotels ? d.hotels.length : 0} Hotels</span>
                    </div>
                    <h3 class="text-lg font-bold text-white">${d.name}</h3>
                    <p class="text-xs text-slate-300 line-clamp-2">${d.shortDesc || ''}</p>
                    <div class="pt-2 flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span>Explore Details & Hotels</span>
                        <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        if(btn.getAttribute('data-category') === category) {
            btn.className = "px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md filter-btn";
        } else {
            btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition filter-btn";
        }
    });
}

function filterDestinations(category) {
    renderDestinations(category);
}

function openDestModalById(id) {
    const destinations = JSON.parse(localStorage.getItem('btb_destinations')) || [];
    const dest = destinations.find(d => d.id === id);
    if(dest) openDestModal(dest);
}

function openDestModal(dest) {
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('detailsModalContent');
    const gpsContainer = document.getElementById('gpsNavButtonContainer');
    if (!modal || !content) return;

    if (gpsContainer) {
        gpsContainer.innerHTML = `
            <button onclick="openGoogleMapsNav('${dest.name}', '${dest.district}')" class="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-emerald-500 transition shadow">
                <i class="fa-solid fa-location-arrow text-yellow-300"></i> GPS Navigation 📍
            </button>
        `;
    }

    let hotelsHtml = (dest.hotels && dest.hotels.length > 0) ? dest.hotels.map(h => `
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
            <img src="${h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}" class="w-16 h-16 rounded-lg object-cover" alt="${h.name}">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h4 class="text-xs font-bold text-white">${h.name}</h4>
                    <span class="text-yellow-400 text-[10px]">${'⭐'.repeat(h.rating)} (${h.rating} Star)</span>
                </div>
                <p class="text-[11px] text-slate-300 mt-0.5">${h.description || ''}</p>
                ${h.url ? `<a href="${h.url}" target="_blank" class="inline-block mt-1 text-[11px] text-emerald-400 font-bold hover:underline"><i class="fa-solid fa-globe mr-1"></i> Official Website</a>` : ''}
            </div>
        </div>
    `).join('') : `<p class="text-xs text-slate-400">No hotels attached for this destination yet.</p>`;

    content.innerHTML = `
        <div class="space-y-4">
            <div class="h-64 rounded-2xl overflow-hidden relative">
                <img src="${dest.image || ''}" class="w-full h-full object-cover" alt="${dest.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <h2 class="absolute bottom-4 left-4 text-2xl font-extrabold text-white">${dest.name}</h2>
            </div>
            <div>
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">${dest.district} Region</span>
                <p class="text-xs text-slate-200 mt-2 leading-relaxed whitespace-pre-line">${dest.fullDesc || dest.shortDesc || ''}</p>
            </div>
            <div class="border-t border-slate-800 pt-4">
                <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-hotel text-emerald-400"></i> Recommended Hotels & Resorts (Top Rated)
                </h3>
                <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    ${hotelsHtml}
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeDetailsModal() { document.getElementById('detailsModal').classList.add('hidden'); }

function renderBoardMembers() {
    const grid = document.getElementById('boardMembersGrid');
    if (!grid) return;
    const members = JSON.parse(localStorage.getItem('btb_board_members')) || [];
    if (members.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-2 text-center py-6">No board members added yet.</p>`;
        return;
    }
    grid.innerHTML = members.map(m => `
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4">
            <img src="${m.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}" class="w-16 h-16 rounded-xl object-cover" alt="${m.name}">
            <div class="space-y-1 flex-1">
                <h4 class="text-sm font-bold text-white">${m.name}</h4>
                <p class="text-xs text-emerald-400 font-semibold">${m.role}</p>
                ${m.bio ? `<p class="text-xs text-slate-300">${m.bio}</p>` : ''}
                <p class="text-[11px] text-slate-400"><i class="fa-solid fa-envelope mr-1"></i> ${m.contact || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

function openBoardModal() {
    renderBoardMembers();
    document.getElementById('boardModal').classList.remove('hidden');
}
function closeBoardModal() { document.getElementById('boardModal').classList.add('hidden'); }

function openNoticeModal(fileUrl, title) {
    document.getElementById('pdfModalTitle').textContent = title;
    document.getElementById('pdfFrame').src = fileUrl;
    document.getElementById('pdfModal').classList.remove('hidden');
}
function closePdfModal() {
    document.getElementById('pdfModal').classList.add('hidden');
    document.getElementById('pdfFrame').src = "";
}

window.addEventListener('DOMContentLoaded', () => {
    renderSlide(0);
    startTimer();
    renderNotices();
    renderDestinations('all');
});