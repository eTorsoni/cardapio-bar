import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";

export default function App() {

  // ===========================
  // ESTADOS
  // ===========================

  const [happyHour, setHappyHour] = useState([]);
  const [combos, setCombos] = useState([]);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // ===========================
  // CSS EMBUTIDO
  // ===========================

  useEffect(() => {

    const style = document.createElement("style");

    style.innerHTML = `

/* TODO O style.css SERÁ COLOCADO AQUI
   (na Parte 2) */

`;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };

  }, []);

  // ===========================
  // CARREGAR PRODUTOS
  // ===========================

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {

    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    setHappyHour(
      data.filter(
        produto => produto.category === "Happy Hour"
      )
    );

    setCombos(
      data.filter(
        produto =>
          produto.category.includes("Combos")
      )
    );

  }

  // ===========================
  // JSX
  // ===========================

  return (

    <>

      <header className="header">

        <div className="header-content">

          <h1 className="logo">

            Happy Hour Bar

          </h1>

          <button
            className="cart-btn"
            onClick={() => setCartOpen(true)}
          >

            🛒 Carrinho

            <span className="cart-count">

              {cart.length}

            </span>

          </button>

        </div>

      </header>

      <main className="container">

        <section className="hero">

          <div className="hero-content">

            <span className="hero-label">

              Happy Hour Bar

            </span>

            <h2 className="hero-title">

              O ponto certo para seus melhores drinks.

            </h2>

            <p className="hero-text">

              Explore um cardápio de bebidas geladas,
              petiscos crocantes e combos premium
              com energia para sua noite.

            </p>

            <div className="hero-actions">

              <a
                href="#happyHourMenu"
                className="hero-btn"
              >

                Ver Cardápio

              </a>

              <a
                href="#combosMenu"
                className="hero-secondary"
              >

                Ver Combos

              </a>

            </div>

          </div>

        </section>

        <section className="menu-section">

          <h2 className="section-title">

            Happy Hour

          </h2>

          <div
            className="menu-grid"
            id="happyHourMenu"
          >

            {/* Cards serão adicionados na Parte 3 */}

          </div>

        </section>

        <section className="menu-section">

          <h2 className="section-title">

            Combos com Energéticos

          </h2>

          <div
            className="menu-grid"
            id="combosMenu"
          >

            {/* Cards serão adicionados na Parte 3 */}

          </div>

        </section>

      </main>

    </>

  );

}
style.innerHTML = `

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

:root{

    --primary-color:#D4AF37;
    --dark-bg:#0a0a0a;
    --card-bg:#1a1a1a;

    --text-light:#ffffff;
    --text-muted:#cccccc;

    --accent-orange:#FF8C00;
    --success-color:#4CAF50;

}

body{

    font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;

    background:var(--dark-bg);

    color:var(--text-light);

    line-height:1.6;

}

.header{

    background:
    linear-gradient(
        135deg,
        var(--card-bg) 0%,
        #1a1a1a 100%
    );

    border-bottom:3px solid var(--primary-color);

    padding:20px 0;

    position:sticky;

    top:0;

    z-index:100;

}

.header-content{

    max-width:1200px;

    margin:auto;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 20px;

}

.logo{

    font-size:32px;

    font-weight:bold;

    color:var(--primary-color);

    text-shadow:
    2px 2px 4px
    rgba(0,0,0,.8);

}

.cart-btn{

    background:
    linear-gradient(
        135deg,
        var(--accent-orange),
        #E67E22
    );

    color:#fff;

    border:none;

    padding:12px 24px;

    border-radius:25px;

    display:flex;

    align-items:center;

    gap:8px;

    cursor:pointer;

    font-size:16px;

    font-weight:bold;

    transition:.3s;

}

.cart-btn:hover{

    transform:translateY(-2px);

    box-shadow:
    0 8px 20px
    rgba(255,140,0,.4);

}

.cart-count{

    background:var(--primary-color);

    color:#000;

    width:24px;

    height:24px;

    border-radius:50%;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:12px;

    font-weight:bold;

}

.container{

    max-width:1200px;

    margin:auto;

    padding:40px 20px;

}

`;