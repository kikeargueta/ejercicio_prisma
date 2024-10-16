'use client';
import { useState, useEffect } from 'react';
import './styles.css'; // Importar los estilos CSS

// Definir la interfaz para el Producto
interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [codigoBuscar, setCodigoBuscar] = useState<string>(''); // Tipo string para la búsqueda
  const [productoBuscado, setProductoBuscado] = useState<Producto | null>(null); // Producto buscado puede ser null si no se encuentra
  const [formData, setFormData] = useState({ nombre: '', codigo: '', precio: '' });
  const [actualizarData, setActualizarData] = useState({ id: '', nombre: '', codigo: '', precio: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Mensaje de error general
  const [view, setView] = useState<'inicio' | 'listar' | 'buscar' | 'crear' | 'actualizar'>('inicio'); // Control de vistas

  // Obtener todos los productos
  useEffect(() => {
    if (view === 'listar') {
      fetch('/productos')
        .then((res) => res.json())
        .then((data: Producto[]) => setProductos(data));
    }
  }, [view]);

  // Manejar búsqueda por código
  const buscarProductoPorCodigo = () => {
    if (!codigoBuscar) {
      setErrorMessage('Por favor ingrese un código para buscar.');
      return;
    }

    fetch(`/productos/${codigoBuscar}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Producto no encontrado');
        }
        return res.json();
      })
      .then((data: Producto) => {
        setProductoBuscado(data);
        setErrorMessage(null);
      })
      .catch((err) => {
        setProductoBuscado(null);
        setErrorMessage(err.message);
      })
      .finally(() => {
        setCodigoBuscar(''); // Limpiar el campo de búsqueda después de buscar
      });
  };

  // Manejar el envío del formulario para crear un producto
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, codigo, precio } = formData;

    // Validaciones
    if (!nombre || !codigo || !precio) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    // Conversión del precio a número antes de enviarlo
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico)) {
      setErrorMessage('El precio debe ser un número válido.');
      return;
    }

    fetch('/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        codigo,
        precio: precioNumerico // Asegurarse de que el precio se envía como número
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message);
          });
        }
        return res.json();
      })
      .then((nuevoProducto: Producto) => {
        setProductos([...productos, nuevoProducto]);
        setFormData({ nombre: '', codigo: '', precio: '' });
        setErrorMessage(null);
        setView('listar'); // Volver a la vista de listado después de crear
      })
      .catch((err) => {
        setErrorMessage('Error al crear producto: ' + err.message); // Mostrar mensaje de error
      });
  };

  // Manejar el envío del formulario para actualizar un producto
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, nombre, codigo, precio } = actualizarData;

    // Validaciones
    if (!id || !nombre || !codigo || !precio) {
      setErrorMessage('Todos los campos son obligatorios para actualizar.');
      return;
    }

    // Conversión del precio a número antes de enviarlo
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico)) {
      setErrorMessage('El precio debe ser un número válido.');
      return;
    }

    fetch('/productos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        nombre,
        codigo,
        precio: precioNumerico
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message);
          });
        }
        return res.json();
      })
      .then((productoActualizado: Producto) => {
        const updatedProductos = productos.map((prod) =>
          prod.id === productoActualizado.id ? productoActualizado : prod
        );
        setProductos(updatedProductos);
        setActualizarData({ id: '', nombre: '', codigo: '', precio: '' });
        setErrorMessage(null);
        setView('listar'); // Volver a la vista de listado después de actualizar
      })
      .catch((err) => {
        setErrorMessage('Error al actualizar producto: ' + err.message); // Mostrar mensaje de error
      });
  };

  // Volver al inicio y limpiar todos los datos
  const volverAlInicio = () => {
    setView('inicio');
    setCodigoBuscar('');
    setProductoBuscado(null);
    setFormData({ nombre: '', codigo: '', precio: '' });
    setActualizarData({ id: '', nombre: '', codigo: '', precio: '' });
    setErrorMessage(null);
  };

  return (
    <div className="container">
      {view === 'inicio' && (
        <>
          <h1>Bienvenido a la Gestión de Productos</h1>
          <div className="menu-container">
            <button className="buscar" onClick={() => setView('listar')}>Listar Productos</button>
            <button className="buscar" onClick={() => setView('buscar')}>Buscar Producto</button>
            <button className="crear" onClick={() => setView('crear')}>Crear Producto</button>
            <button className="actualizar" onClick={() => setView('actualizar')}>Actualizar Producto</button>
          </div>
        </>
      )}

      {view === 'listar' && (
        <>
          <h2>Listado de Productos</h2>
          <ul>
            {productos.map((producto) => (
              <li key={producto.id}>
                {producto.nombre} - {producto.codigo} - ${producto.precio}
              </li>
            ))}
          </ul>
          <button className="volver" onClick={volverAlInicio}>Volver al Inicio</button>
        </>
      )}

      {view === 'buscar' && (
        <>
          <h2>Buscar Producto por Código</h2>
          <div className="form-group">
            <label>Código del Producto:</label>
            <input
              type="text"
              value={codigoBuscar}
              onChange={(e) => setCodigoBuscar(e.target.value)}
            />
            <button className="buscar" onClick={buscarProductoPorCodigo}>Buscar</button>
          </div>
          {productoBuscado && (
            <div>
              <h4>Producto Encontrado</h4>
              <p>{productoBuscado.nombre} - {productoBuscado.codigo} - ${productoBuscado.precio}</p>
            </div>
          )}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button className="volver" onClick={volverAlInicio}>Volver al Inicio</button>
        </>
      )}

      {view === 'crear' && (
        <>
          <h2>Crear Producto</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Código:</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Precio:</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              />
            </div>
            <button className="crear" type="submit">Crear Producto</button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button className="volver" onClick={volverAlInicio}>Volver al Inicio</button>
        </>
      )}

      {view === 'actualizar' && (
        <>
          <h2>Actualizar Producto</h2>
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label>ID del Producto:</label>
              <input
                type="text"
                value={actualizarData.id}
                onChange={(e) => setActualizarData({ ...actualizarData, id: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={actualizarData.nombre}
                onChange={(e) => setActualizarData({ ...actualizarData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Código:</label>
              <input
                type="text"
                value={actualizarData.codigo}
                onChange={(e) => setActualizarData({ ...actualizarData, codigo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Precio:</label>
              <input
                type="number"
                value={actualizarData.precio}
                onChange={(e) => setActualizarData({ ...actualizarData, precio: e.target.value })}
              />
            </div>
            <button className="actualizar" type="submit">Actualizar Producto</button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button className="volver" onClick={volverAlInicio}>Volver al Inicio</button>
        </>
      )}
    </div>
  );
}
