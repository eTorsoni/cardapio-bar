import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import "./style.css";

const emptyForm = {
  name: "",
  category: "Happy Hour",
  price: "",
  original_price: "",
  image_url: "",
  description: "",
  badge: "",
};

function App() {
  const [happyHour, setHappyHour] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

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

    setHappyHour(data.filter((produto) => produto.category === "Happy Hour"));
    setCombos(data.filter((produto) => produto.category === "Combos"));
    setLoading(false);
  }

  useEffect(() => {
    carregarProdutos();

    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          carregarProdutos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function adicionarAoCarrinho(produto) {
    setCart((cartAtual) => {
      const existe = cartAtual.find((item) => item.id === produto.id);

      if (existe) {
        return cartAtual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: Number(item.quantidade || 0) + 1 }
            : item
        );
      }

      return [
        ...cartAtual,
        {
          ...produto,
          quantidade: 1,
        },
      ];
    });
  }

  function removerDoCarrinho(id) {
    setCart((cartAtual) => cartAtual.filter((item) => item.id !== id));
  }

  function aumentarQuantidade(id) {
    setCart((cartAtual) =>
      cartAtual.map((item) =>
        item.id === id
          ? { ...item, quantidade: Number(item.quantidade || 0) + 1 }
          : item
      )
    );
  }

  function diminuirQuantidade(id) {
    setCart((cartAtual) =>
      cartAtual
        .map((item) =>
          item.id === id
            ? { ...item, quantidade: Number(item.quantidade || 0) - 1 }
            : item
        )
        .filter((item) => Number(item.quantidade || 0) > 0)
    );
  }

  function fecharCarrinho() {
    setCartOpen(false);
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setFormData(emptyForm);
  }

  function showSupabaseError(message, error) {
    console.error(message, error);
    alert(`${message}\n\nDetalhes: ${error?.message || "Erro desconhecido do Supabase."}`);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    if (!formData.category) {
      alert("Informe a categoria.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price || 0),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      image_url:
        formData.image_url.trim() ||
        "https://placehold.co/600x400/1a1a1a/D4AF37?text=Happy+Hour",
      description: formData.description.trim(),
      badge: formData.badge.trim(),
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);

      if (error) {
        showSupabaseError("Não foi possível atualizar o produto.", error);
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert([payload]);

      if (error) {
        showSupabaseError("Não foi possível adicionar o produto.", error);
        return;
      }
    }

    resetForm();
    await carregarProdutos();
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      category: product.category || "Happy Hour",
      price: String(product.price ?? ""),
      original_price: product.original_price ? String(product.original_price) : "",
      image_url: product.image_url || "",
      description: product.description || "",
      badge: product.badge || "",
    });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja excluir este item do cardápio?");

    if (!confirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Não foi possível excluir o produto.");
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    await carregarProdutos();
  }

  const cartTotalItems = cart.reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantidade || 0),
    0
  );

  const entrega = cart.length > 0 ? 8 : 0;
  const total = subtotal + entrega;

  function Card(produto) {
    return (
      <div className="product-card" key={produto.id}>
        {produto.badge && <span className="product-badge">{produto.badge}</span>}

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
          <div className="product-category">{produto.category}</div>
          <h3 className="product-name">{produto.name}</h3>
          <p className="product-description">{produto.description}</p>

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

          <button className="add-to-cart-btn" onClick={() => adicionarAoCarrinho(produto)}>
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
          <h1 className="logo">🍺 Happy Hour Bar</h1>

          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            🛒 Carrinho
            <span className="cart-count">{cartTotalItems}</span>
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-content">
            <span className="hero-label">HAPPY HOUR BAR</span>
            <h2 className="hero-title">O ponto certo para seus melhores drinks.</h2>
            <p className="hero-text">
              Explore um cardápio completo de bebidas, petiscos e combos premium para
              aproveitar seu Happy Hour.
            </p>

            <div className="hero-actions">
              <a href="#happy" className="hero-btn">
                Ver Cardápio
              </a>
              <a href="#combos" className="hero-secondary">
                Ver Combos
              </a>
            </div>
          </div>
        </section>

        <section id="happy" className="menu-section">
          <h2 className="section-title">Happy Hour</h2>

          <div className="menu-grid">
            {loading ? (
              <h3>Carregando produtos...</h3>
            ) : happyHour.length === 0 ? (
              <h3>Nenhum produto encontrado.</h3>
            ) : (
              happyHour.map((produto) => <Card key={produto.id} {...produto} />)
            )}
          </div>
        </section>

        <section id="combos" className="menu-section">
          <h2 className="section-title">Combos com Energéticos</h2>

          <div className="menu-grid">
            {loading ? (
              <h3>Carregando produtos...</h3>
            ) : combos.length === 0 ? (
              <h3>Nenhum combo encontrado.</h3>
            ) : (
              combos.map((produto) => <Card key={produto.id} {...produto} />)
            )}
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="section-title">Gerenciar Cardápio</h2>

          <form className="crud-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Nome
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Caipirinha"
                />
              </label>

              <label>
                Categoria
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                >
                  <option value="Happy Hour">Happy Hour</option>
                  <option value="Combos">Combos</option>
                </select>
              </label>

              <label>
                Preço
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="29.90"
                />
              </label>

              <label>
                Preço original
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange("original_price", e.target.value)}
                  placeholder="49.90"
                />
              </label>

              <label>
                Imagem (URL)
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange("image_url", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label>
                Badge
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => handleInputChange("badge", e.target.value)}
                  placeholder="Popular"
                />
              </label>
            </div>

            <label>
              Descrição
              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva o produto..."
              />
            </label>

            <div className="crud-actions">
              <button type="submit" className="submit-btn">
                {editingId ? "Atualizar produto" : "Adicionar produto"}
              </button>

              {editingId && (
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            {[...happyHour, ...combos].map((produto) => (
              <div className="admin-item" key={produto.id}>
                <div>
                  <strong>{produto.name}</strong>
                  <span>{produto.category}</span>
                </div>

                <div className="admin-actions">
                  <button type="button" className="edit-btn" onClick={() => handleEdit(produto)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(produto.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {cartOpen && (
        <div className="modal active" onClick={fecharCarrinho}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seu Carrinho</h2>
              <button type="button" className="close-btn" onClick={fecharCarrinho}>
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="empty-cart">Seu carrinho está vazio.</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-qty">Quantidade: {item.quantidade}</div>
                      </div>

                      <div className="cart-item-price">
                        R$ {(Number(item.price) * Number(item.quantidade)).toFixed(2)}
                      </div>

                      <button className="remove-btn" onClick={() => diminuirQuantidade(item.id)}>
                        -
                      </button>

                      <button className="remove-btn" onClick={() => aumentarQuantidade(item.id)}>
                        +
                      </button>

                      <button className="remove-btn" onClick={() => removerDoCarrinho(item.id)}>
                        Remover
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Entrega</span>
                    <span>R$ {entrega.toFixed(2)}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;