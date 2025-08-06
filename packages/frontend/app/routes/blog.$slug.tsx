import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";

// 定義文章數據類型
type BlogPost = {
  title: string;
  content: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  imageUrl?: string; // 可選屬性
};

// 模擬文章數據，實際應用中應從後端獲取
const blogPosts: Record<string, BlogPost> = {
  "exploring-cloud-native": {
    title: "探索雲原生技術：從概念到實踐",
    content: `
      <p class="lead">雲原生技術正在改變我們構建和部署應用程序的方式。本文將深入探討雲原生的核心概念，以及如何在實際項目中應用這些技術。</p>
      
      <h2>什麼是雲原生？</h2>
      <p>雲原生是一種構建和運行應用程序的方法，它充分利用雲計算模型的優勢。雲原生技術使組織能夠在公共雲、私有雲和混合雲等現代動態環境中構建和運行可擴展的應用程序。</p>
      
      <p>雲原生的核心理念包括：</p>
      <ul>
        <li>微服務架構</li>
        <li>容器化</li>
        <li>動態管理</li>
        <li>服務網格</li>
        <li>聲明式API</li>
      </ul>
      
      <h2>雲原生的關鍵技術</h2>
      <p>要實現真正的雲原生應用，我們需要掌握以下關鍵技術：</p>
      
      <h3>容器技術</h3>
      <p>容器是輕量級、可移植和自給自足的執行環境，它將應用程序及其依賴項打包在一起。Docker是最流行的容器化平台之一，它使開發人員能夠輕鬆地創建、部署和運行容器化應用程序。</p>
      
      <h3>容器編排</h3>
      <p>隨著容器數量的增加，管理它們變得越來越複雜。容器編排工具如Kubernetes提供了一個平台來自動化容器的部署、擴展和管理。</p>
      
      <h3>服務網格</h3>
      <p>服務網格是一個專用的基礎設施層，用於處理服務間通信。它負責在現代雲原生應用程序中可靠地傳遞請求。Istio是一個流行的服務網格實現。</p>
      
      <h2>實踐雲原生</h2>
      <p>將雲原生理念應用到實際項目中需要考慮以下幾點：</p>
      
      <h3>設計原則</h3>
      <p>雲原生應用應該遵循12因素應用程序的設計原則，包括代碼庫、依賴項、配置、後端服務、構建-發布-運行、進程、端口綁定、並發、可處置性、開發/生產環境一致性、日誌和管理流程。</p>
      
      <h3>持續集成和持續部署</h3>
      <p>CI/CD是雲原生開發的重要組成部分。它允許開發人員頻繁地將代碼更改合併到主分支中，並自動部署到生產環境。</p>
      
      <h3>監控和可觀察性</h3>
      <p>在雲原生環境中，監控和可觀察性變得更加重要。Prometheus和Grafana等工具可以幫助收集和可視化指標，而ELK堆棧可以用於日誌管理。</p>
      
      <h2>結論</h2>
      <p>雲原生技術為構建現代應用程序提供了強大的框架。通過採用微服務架構、容器化和自動化部署等實踐，組織可以提高開發速度、擴展能力和可靠性。</p>
      
      <p>然而，轉向雲原生並不是一蹴而就的。它需要組織在文化、流程和技術方面進行變革。通過逐步採用雲原生實踐，組織可以逐漸實現其好處，並為未來的創新奠定基礎。</p>
    `,
    date: "2025-07-15",
    author: "DankoPeng",
    category: "技術",
    tags: ["雲原生", "Kubernetes", "微服務", "容器化", "DevOps"],
    readTime: "8 分鐘",
  },
  "taipei-city-walk": {
    title: "旅行中的思考：台北城市漫步",
    content: `
      <p class="lead">在台北的街頭漫步，感受這座城市的脈動與活力。從熱鬧的夜市到寧靜的公園，每一處都有其獨特的魅力。</p>
      
      <figure>
        <img src="https://images.unsplash.com/photo-1470004914212-05527e49370b?q=80&w=1000" alt="台北城市風景" class="rounded-lg w-full" />
        <figcaption class="text-center text-sm text-muted-foreground mt-2">台北城市風景</figcaption>
      </figure>
      
      <h2>初探台北</h2>
      <p>台北，這座融合了傳統與現代的城市，總是能給人帶來驚喜。我的旅程從台北車站開始，這座繁忙的交通樞紐每天迎送著數十萬的旅客。</p>
      
      <p>走出車站，映入眼簾的是高聳的摩天大樓與古老的廟宇並存的景象。這種對比正是台北的魅力所在——傳統與現代的完美融合。</p>
      
      <h2>夜市文化</h2>
      <p>台北的夜市文化舉世聞名。我先後造訪了士林夜市、寧夏夜市和饒河街夜市，每一處都有其獨特的風味。</p>
      
      <p>在士林夜市，我品嚐了著名的大雞排和珍珠奶茶；在寧夏夜市，我嘗試了各種傳統小吃；而在饒河街夜市，我被琳琅滿目的商品和美食所吸引。</p>
      
      <p>夜市不僅是美食的天堂，更是了解當地文化的窗口。在這裡，你可以看到台灣人的日常生活，感受他們的熱情與活力。</p>
      
      <h2>城市綠洲</h2>
      <p>台北雖然是一座繁忙的都市，但也不乏寧靜的綠洲。大安森林公園是台北市中心最大的公園，被譽為「台北的肺」。</p>
      
      <p>清晨時分，公園裡已經有不少人在晨練。有的人在慢跑，有的人在打太極拳，還有的人在練習氣功。這種健康的生活方式令人欽佩。</p>
      
      <p>除了大安森林公園，我還參觀了陽明山國家公園。這裡的自然風光令人心曠神怡，是遠離城市喧囂的絕佳去處。</p>
      
      <h2>文化探索</h2>
      <p>台北的文化底蘊深厚，博物館和藝術館比比皆是。國立故宮博物院收藏了大量的中國藝術品，是世界上最重要的博物館之一。</p>
      
      <p>台北當代藝術館則展示了現代藝術的多樣性和創新性。這種傳統與現代的對話，正是台北文化的縮影。</p>
      
      <h2>人情味</h2>
      <p>台北最令人難忘的，是這座城市的人情味。無論是在便利店購物，還是在餐廳用餐，服務人員總是面帶微笑，熱情有禮。</p>
      
      <p>在一次迷路時，一位當地居民不僅為我指路，還親自帶我到目的地。這種溫暖的人情味，讓我對台北有了更深的感情。</p>
      
      <h2>結語</h2>
      <p>台北是一座充滿活力和魅力的城市。它既有現代都市的便利，又保留了傳統文化的精髓。在這裡，你可以體驗到多元的文化、美食和生活方式。</p>
      
      <p>我的台北之旅雖然短暫，但留下了深刻的印象。我相信，這座城市還有更多值得探索的地方，期待下次再來。</p>
    `,
    date: "2025-07-10",
    author: "DankoPeng",
    category: "生活",
    tags: ["旅行", "台北", "城市漫步", "文化", "美食"],
    readTime: "6 分鐘",
    imageUrl: "https://images.unsplash.com/photo-1470004914212-05527e49370b?q=80&w=1000",
  },
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  
  // 檢查文章是否存在
  if (!slug || !blogPosts[slug as keyof typeof blogPosts]) {
    throw new Response("文章不存在", { status: 404 });
  }
  
  return json({ post: blogPosts[slug as keyof typeof blogPosts] });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.post) {
    return [
      { title: "文章不存在 - DankoPeng" },
      { name: "description", content: "抱歉，您請求的文章不存在。" },
      { name: "viewport", content: "width=device-width,initial-scale=1" },
    ];
  }
  
  return [
    { title: `${data.post.title} - DankoPeng` },
    { name: "description", content: data.post.content.substring(0, 160).replace(/<[^>]*>/g, '') },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
  ];
};

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <article className="py-12 md:py-16">
          <div className="container max-w-3xl mx-auto px-4 md:px-6">
            {/* 文章標題與元數據 */}
            <header className="mb-8 md:mb-10 lg:mb-12">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                <time dateTime={post.date}>{post.date}</time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-4 md:mb-6">{post.title}</h1>
              
              <div className="flex items-center">
                <div className="mr-2 md:mr-3 h-8 w-8 md:h-9 md:w-9 overflow-hidden rounded-full bg-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-full w-full p-1.5"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium">{post.author}</p>
                </div>
              </div>
            </header>

            {/* 文章特色圖片 */}
            {'imageUrl' in post && post.imageUrl && (
              <figure className="mb-8 md:mb-10">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full rounded-md"
                  loading="lazy"
                />
              </figure>
            )}

            {/* 文章內容 */}
            <div className="prose prose-slate prose-sm md:prose-base max-w-none">
              {post.content}
            </div>
            
            {/* 文章標籤 */}
            <div className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-border/10">
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog/tag/${tag}`}
                    className="px-2.5 md:px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* 分享按鈕 */}
            <div className="mt-12 pt-6 border-t border-border/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">分享這篇文章</span>
                <div className="flex space-x-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect width="4" height="12" x="2" y="9"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
