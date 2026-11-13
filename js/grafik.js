// Grafik hasil kuesioner perilaku hemat energi (Chart.js)
// Membaca data/data-perilaku-energi.json -> ringkasan.kategori
// Ada 3 tampilan yang bisa dipilih lewat tombol: Batang, Donat, Mendatar.

const canvas = document.getElementById("energyChart");
const tombolTab = document.querySelectorAll(".chart-tab");

if (canvas) {
	let chart = null;
	let labels = [];
	let nilai = [];
	let total = 0;
	let judul = "";

	const warna = ["#4f6b14", "#7c971e", "#a9bd39", "#d4a323"];

	// Menulis jumlah total responden di tengah grafik donat
	const teksTengah = {
		id: "teksTengah",
		afterDraw(c) {
			const { ctx, chartArea } = c;
			const x = (chartArea.left + chartArea.right) / 2;
			const y = (chartArea.top + chartArea.bottom) / 2;
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#1f2d24";
			ctx.font = "700 34px 'DM Sans', sans-serif";
			ctx.fillText(total, x, y - 10);
			ctx.fillStyle = "#647168";
			ctx.font = "500 13px 'DM Sans', sans-serif";
			ctx.fillText("responden", x, y + 18);
			ctx.restore();
		}
	};

	function buatGrafik(tipe) {
		if (chart) chart.destroy();

		const donat = tipe === "doughnut";
		const mendatar = tipe === "horizontal";

		chart = new Chart(canvas, {
			type: donat ? "doughnut" : "bar",
			data: {
				labels: labels,
				datasets: [
					{
						label: "Jumlah siswa",
						data: nilai,
						backgroundColor: warna,
						borderRadius: donat ? 0 : 8,
						borderWidth: donat ? 3 : 0,
						borderColor: "#ffffff"
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: mendatar ? "y" : "x",
				cutout: donat ? "62%" : undefined,
				plugins: {
					legend: { display: donat, position: "bottom" },
					title: { display: true, text: judul },
					tooltip: {
						callbacks: {
							label: (ctx) => {
								const v = typeof ctx.parsed === "number"
									? ctx.parsed
									: (mendatar ? ctx.parsed.x : ctx.parsed.y);
								const persen = ((v / total) * 100).toFixed(1);
								return v + " siswa (" + persen + "%)";
							}
						}
					}
				},
				scales: donat
					? {}
					: mendatar
						? { x: { beginAtZero: true, title: { display: true, text: "Jumlah siswa" } } }
						: { y: { beginAtZero: true, title: { display: true, text: "Jumlah siswa" } } }
			},
			plugins: donat ? [teksTengah] : []
		});
	}

	fetch("data/data-perilaku-energi.json")
		.then((res) => {
			if (!res.ok) throw new Error("File JSON tidak ditemukan (" + res.status + ")");
			return res.json();
		})
		.then((data) => {
			const kategori = data.ringkasan.kategori;
			const urutan = ["Sangat Baik", "Baik", "Cukup", "Kurang"];
			labels = urutan.filter((k) => k in kategori);
			nilai = labels.map((k) => kategori[k]);
			total = nilai.reduce((a, b) => a + b, 0);
			judul = data.meta.judul + " (" + data.meta.jumlah_responden + " responden)";

			buatGrafik("bar");

			tombolTab.forEach((tombol) => {
				tombol.addEventListener("click", () => {
					tombolTab.forEach((t) => {
						t.classList.remove("is-active");
						t.setAttribute("aria-pressed", "false");
					});
					tombol.classList.add("is-active");
					tombol.setAttribute("aria-pressed", "true");
					buatGrafik(tombol.dataset.type);
				});
			});
		})
		.catch((err) => {
			console.error(err);
			canvas.insertAdjacentHTML("afterend", "<p>Data grafik belum bisa dimuat: " + err.message + "</p>");
		});
}
