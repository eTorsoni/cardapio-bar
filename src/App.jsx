import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import "./style.css";

function App() {

  // ===========================
  // ESTADOS
  // ===========================

  const [happyHour, setHappyHour] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===========================
  // CARREGAR PRODUTOS
  // ===========================

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      setLoading(false);
      return;
    }

    setHappyHour(
      data.filter(
        (produto) => produto.category === "Happy Hour"
      )
    );

    setCombos(
      data.filter(
        (produto) => produto.category === "Combos"
      )
    );

    setLoading(false);

  }

  // ===========================
  // CARRINHO
  // ===========================

  function adicionarAoCarrinho(produto) {

    const existe = cart.find(
      (item) => item.id === produto.id
    );

    if (existe) {

      setCart(
        cart.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
              }
            : item
        )
      );

      return;
    }

    setCart([
      ...cart,
      {
        ...produto,
        quantidade: 1,
      },
    ]);

  }

  function removerDoCarrinho(id) {

    setCart(
      cart.filter((item) => item.id !== id)
    );

  }

  function aumentarQuantidade(id) {

    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidade: item.quantidade + 1,
            }
          : item
      )
    );

  }

  function diminuirQuantidade(id) {

    setCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantidade: item.quantidade - 1,
              }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );

  }

  // ===========================
  // TOTAIS
  // ===========================

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantidade,
    0
  );

  const entrega =
    cart.length > 0 ? 8 : 0;

  const total = subtotal + entrega;

  // ===========================
  // CARD
  // ===========================

  function Card(produto) {

    return (

      <div
        className="product-card"
        key={produto.id}
      >

        {produto.badge && (
          <span className="product-badge">
            {produto.badge}
          </span>
        )}

        <div className="product-image-wrapper">

          <img
            src={produto.image_url}
            alt={produto.name}
            className="product-image"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/600x400/1a1a1a/D4AF37?text=Happy+Hour";
            }}
          />

        </div>

        <div className="product-info">

          <div className="product-category">
            {produto.category}
          </div>

          <h3 className="product-name">
            {produto.name}
          </h3>

          <p className="product-description">
            {produto.description}
          </p>

          <div className="price-section">

            {produto.original_price && (
              <span className="original-price">
                R$ {Number(produto.original_price).toFixed(2)}
              </span>
            )}

            <span className="current-price">
              R$ {Number(produto.price).toFixed(2)}
            </span>

          </div>

          <button
            className="add-to-cart-btn"
            onClick={() =>
              adicionarAoCarrinho(produto)
            }
          >
            Adicionar
          </button>

        </div>

      </div>

    );

  }

   return (
    <>

      <header className="header">

        <div className="header-content">

          <h1 className="logo">
            🍺 Happy Hour Bar
          </h1>

          <button className="cart-btn">

            🛒 Carrinho

            <span className="cart-count">
              {cart.reduce(
                (total, item) =>
                  total + item.quantidade,
                0
              )}
            </span>

          </button>

        </div>

      </header>

      <main className="container">

        <section className="hero">

          <div className="hero-content">

            <span className="hero-label">
              HAPPY HOUR BAR
            </span>

            <h2 className="hero-title">
              O ponto certo para seus melhores drinks.
            </h2>

            <p className="hero-text">
              Explore um cardápio completo de bebidas,
              petiscos e combos premium para aproveitar
              seu Happy Hour.
            </p>

            <div className="hero-actions">

              <a
                href="#happy"
                className="hero-btn"
              >
                Ver Cardápio
              </a>

              <a
                href="#combos"
                className="hero-secondary"
              >
                Ver Combos
              </a>

            </div>

          </div>

        </section>

        <section
          id="happy"
          className="menu-section"
        >

          <h2 className="section-title">
            Happy Hour
          </h2>

          <div className="menu-grid">

            {loading ? (

              <h3>Carregando produtos...</h3>

            ) : happyHour.length === 0 ? (

              <h3>Nenhum produto encontrado.</h3>

            ) : (

              happyHour.map((produto) => (
                <Card
                  key={produto.id}
                  {...produto}
                />
              ))

            )}

          </div>

        </section>

        <section
          id="combos"
          className="menu-section"
        >

          <h2 className="section-title">
            Combos com Energéticos
          </h2>

          <div className="menu-grid">

            {loading ? (

              <h3>Carregando produtos...</h3>

            ) : combos.length === 0 ? (

              <h3>Nenhum combo encontrado.</h3>

            ) : (

              combos.map((produto) => (
                <Card
                  key={produto.id}
                  {...produto}
                />
              ))

            )}

          </div>

        </section>

        <section className="menu-section">

          <h2 className="section-title">
            🛒 Carrinho
          </h2>

          {cart.length === 0 ? (

            <p
              style={{
                color: "#ccc",
                fontSize: "18px"
              }}
            >
              Seu carrinho está vazio.
            </p>

          ) : (

            <>

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <div className="cart-item-info">

                    <div className="cart-item-name">
                      {item.name}
                    </div>

                    <div className="cart-item-qty">

                      Quantidade:
                      {" "}
                      {item.quantidade}

                    </div>

                  </div>

                  <div className="cart-item-price">

                    R$
                    {" "}
                    {(
                      item.price *
                      item.quantidade
                    ).toFixed(2)}

                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      diminuirQuantidade(item.id)
                    }
                  >
                    -
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      aumentarQuantidade(item.id)
                    }
                  >
                    +
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removerDoCarrinho(item.id)
                    }
                  >
                    Remover
                  </button>

                </div>

              ))}

              <div className="cart-summary">

                <div className="summary-row">

                  <span>Subtotal</span>

                  <span>
                    R$
                    {" "}
                    {subtotal.toFixed(2)}
                  </span>

                </div>

                <div className="summary-row">

                  <span>Entrega</span>

                  <span>
                    R$
                    {" "}
                    {entrega.toFixed(2)}
                  </span>

                </div>

                <div className="summary-row total">

                  <span>Total</span>

                  <span>
                    R$
                    {" "}
                    {total.toFixed(2)}
                  </span>

                </div>

                <button className="checkout-btn">
                  Finalizar Pedido
                </button>

              </div>

            </>

          )}

        </section>

      </main>

    </>
  );

}

export default App;