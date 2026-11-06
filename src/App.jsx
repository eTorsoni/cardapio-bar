import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
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
  const { session, loading: authLoading, signOut } = useAuth();
  const [happyHour, setHappyHour] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedCameraPhoto, setSelectedCameraPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState("Desconhecida");
  const [notificationStatus, setNotificationStatus] = useState("");
  const [notificationBusy, setNotificationBusy] = useState(false);

  async function checkNotificationPermission() {
    if (!Capacitor.isNativePlatform()) {
      setNotificationPermission("Disponível no app Android/iOS");
      setNotificationStatus("Permissões nativas podem ser verificadas no aplicativo instalado no dispositivo.");
      return null;
    }

    const result = await LocalNotifications.checkPermissions();
    setNotificationPermission(result.display);
    return result.display;
  }

  async function requestNotificationPermission() {
    setNotificationBusy(true);
    setNotificationStatus("");
    try {
      let permission = await checkNotificationPermission();
      if (!Capacitor.isNativePlatform()) return;
      if (permission !== "granted") {
        const requested = await LocalNotifications.requestPermissions();
        permission = requested.display;
        setNotificationPermission(permission);
      }
      setNotificationStatus(permission === "granted"
        ? "Permissão concedida. As notificações estão prontas para uso."
        : "Permissão não concedida. Ative as notificações nas configurações do dispositivo.");
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
      setNotificationStatus(error?.message || "Não foi possível verificar ou solicitar a permissão.");
    } finally {
      setNotificationBusy(false);
    }
  }

  async function sendLocalNotification(delaySeconds = 0) {
    setNotificationBusy(true);
    setNotificationStatus("");
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error("Instale e abra o app no Android ou iOS para receber notificações locais.");
      }
      let permission = await checkNotificationPermission();
      if (permission !== "granted") {
        const requested = await LocalNotifications.requestPermissions();
        permission = requested.display;
        setNotificationPermission(permission);
      }
      if (permission !== "granted") {
        throw new Error("Permissão de notificações negada. Ative-a nas configurações do dispositivo.");
      }
      const scheduledAt = new Date(Date.now() + delaySeconds * 1000);
      await LocalNotifications.schedule({ notifications: [{
        id: delaySeconds === 0 ? 1001 : 1000 + Math.floor(Date.now() / 1000) % 100000,
        title: delaySeconds === 0 ? "Happy Hour Bar 🍹" : "Seu alerta de Happy Hour 🍻",
        body: delaySeconds === 0
          ? "Seu próximo drink favorito está esperando. Confira nosso cardápio!"
          : "Hora de aproveitar! Confira as ofertas e combos do Happy Hour Bar.",
        schedule: { at: scheduledAt },
        channelId: "happy-hour-alerts",
      }] });
      setNotificationStatus(delaySeconds === 0
        ? "Notificação enviada. Confira a central de notificações do dispositivo."
        : `Alerta agendado para ${scheduledAt.toLocaleTimeString("pt-BR")}.`);
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      setNotificationStatus(error?.message || "Não foi possível programar a notificação.");
    } finally {
      setNotificationBusy(false);
    }
  }

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    LocalNotifications.createChannel({ id: "happy-hour-alerts", name: "Alertas do Happy Hour", description: "Ofertas e lembretes do bar", importance: 4 })
      .catch((error) => console.error("Erro ao criar canal de notificações:", error));
  }, []);

  async function captureLocation() {
    setLocationLoading(true);
    setLocationError("");

    try {
      let position;

      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== "granted") {
          const requested = await Geolocation.requestPermissions({ permissions: ["location"] });
          if (requested.location !== "granted") {
            throw new Error("Permissão de localização negada. Permita o acesso nas configurações do Android.");
          }
        }

        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      } else {
        if (!navigator.geolocation) {
          throw new Error("Este navegador não oferece suporte à localização.");
        }

        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          });
        });
      }

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      const errorMessages = {
        1: "Permissão de localização negada. Autorize o acesso à localização no navegador.",
        2: "Não foi possível determinar sua localização. Verifique se a localização está ativada.",
        3: "A localização demorou demais para responder. Tente novamente.",
      };
      setLocationError(errorMessages[error?.code] || error?.message || "Não foi possível obter sua localização.");
    } finally {
      setLocationLoading(false);
    }
  }

  async function openImageSource(source) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source,
        saveToGallery: false,
        correctOrientation: true,
      });

      if (image?.webPath) {
        handleInputChange("image_url", image.webPath);
        setSelectedCameraPhoto({ webPath: image.webPath, format: image.format });
        return;
      }

      alert("Não foi possível carregar a imagem selecionada.");
    } catch (error) {
      console.error("Erro ao acessar a câmera/galeria:", error);
      alert("Não foi possível abrir a câmera ou a galeria do dispositivo.");
    }
  }

  function handleOpenCamera() {
    openImageSource(CameraSource.Camera);
  }

  function handleOpenGallery() {
    openImageSource(CameraSource.Photos);
  }

  useEffect(() => {
    if (!session) {
      setHappyHour([]);
      setCombos([]);
      return;
    }

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
  }, [session]);

  if (authLoading) {
    return <div className="auth-loading">Carregando...</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

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
    if (field === "image_url") {
      setSelectedCameraPhoto(null);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setSelectedCameraPhoto(null);
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

    let imageUrl = formData.image_url.trim();
    if (selectedCameraPhoto) {
      try {
        const imageResponse = await fetch(selectedCameraPhoto.webPath);
        if (!imageResponse.ok) {
          throw new Error("Nao foi possivel ler a foto selecionada no dispositivo.");
        }

        const imageBlob = await imageResponse.blob();
        const extension = (selectedCameraPhoto.format || "jpeg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const imagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const contentType = imageBlob.type || `image/${extension === "jpg" ? "jpeg" : extension}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(imagePath, imageBlob, { contentType });

        if (uploadError) {
          showSupabaseError("Nao foi possivel enviar a foto. Confira o bucket de imagens no Supabase.", uploadError);
          return;
        }

        imageUrl = supabase.storage.from("product-images").getPublicUrl(imagePath).data.publicUrl;
      } catch (error) {
        showSupabaseError("Nao foi possivel preparar a foto selecionada.", error);
        return;
      }
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price || 0),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      image_url: imageUrl || "https://placehold.co/600x400/1a1a1a/D4AF37?text=Happy+Hour",
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
    setSelectedCameraPhoto(null);
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

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  function fecharMenu() {
    setMenuOpen(false);
  }

  function handleMenuLinkClick() {
    fecharMenu();
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="brand-wrap">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <h1 className="logo">🍺 Happy Hour Bar</h1>
          </div>

          <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
            <a href="#happy" onClick={handleMenuLinkClick}>Happy Hour</a>
            <a href="#combos" onClick={handleMenuLinkClick}>Combos</a>
            <a href="#admin" onClick={handleMenuLinkClick}>Gerenciar</a>
          </nav>

          <div className="header-actions">
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒 Carrinho
              <span className="cart-count">{cartTotalItems}</span>
            </button>

            <button
              type="button"
              className="logout-btn"
              onClick={async () => {
                await signOut();
              }}
            >
              Sair
            </button>
          </div>
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

        <section className="location-panel" aria-labelledby="location-title">
          <div>
            <h2 id="location-title">Sua localização</h2>
            <p>Use o GPS do celular para capturar suas coordenadas e abrir no Google Maps.</p>
            {location && (
              <div className="location-coordinates" aria-live="polite">
                <span>Latitude: {location.latitude.toFixed(6)}</span>
                <span>Longitude: {location.longitude.toFixed(6)}</span>
                <span>Precisão: aproximadamente {Math.round(location.accuracy)} m</span>
              </div>
            )}
            {locationError && <p className="location-error" role="alert">{locationError}</p>}
          </div>
          <div className="location-actions">
            <button type="button" className="location-btn" onClick={captureLocation} disabled={locationLoading}>
              {locationLoading ? "Obtendo localização..." : location ? "Atualizar localização" : "Obter minha localização"}
            </button>
            {location && (
              <a
                className="location-map-link"
                href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir no Google Maps
              </a>
            )}
          </div>
        </section>

        <section className="location-panel notification-panel" aria-labelledby="notification-title">
          <div>
            <h2 id="notification-title">Alertas do Happy Hour</h2>
            <p>Receba novidades e lembretes do nosso cardápio mesmo quando o app estiver fechado.</p>
            <p aria-live="polite">Permissão: <strong>{notificationPermission}</strong></p>
            {notificationStatus && <p role="status">{notificationStatus}</p>}
          </div>
          <div className="location-actions">
            <button type="button" className="location-btn" onClick={requestNotificationPermission} disabled={notificationBusy}>
              Verificar / permitir notificações
            </button>
            <button type="button" className="location-btn" onClick={() => sendLocalNotification(0)} disabled={notificationBusy}>
              Enviar notificação agora
            </button>
            <button type="button" className="location-btn" onClick={() => sendLocalNotification(5)} disabled={notificationBusy}>
              Agendar alerta em 5 segundos
            </button>
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

        <section id="admin" className="admin-panel">
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
                Badge
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => handleInputChange("badge", e.target.value)}
                  placeholder="Popular"
                />
              </label>
            </div>

            <label className="image-field">
              Imagem
              <div className="image-picker-actions">
                <button type="button" className="camera-action-btn" onClick={handleOpenCamera}>
                  📷 Câmera
                </button>
                <button
                  type="button"
                  className="camera-action-btn secondary"
                  onClick={handleOpenGallery}
                >
                  🖼️ Galeria
                </button>
              </div>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://... ou arquivo local"
              />
            </label>

            <div className="image-preview-wrap">
              <img
                src={
                  formData.image_url ||
                  "https://placehold.co/600x400/1a1a1a/D4AF37?text=Happy+Hour"
                }
                alt="Pré-visualização da imagem do produto"
                className="image-preview"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/600x400/1a1a1a/D4AF37?text=Happy+Hour";
                }}
              />
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
