// Componente de Debug - Pegar en Perfil.jsx temporalmente para ver datos

// Al inicio del componente Perfil, después de los useEffect:
useEffect(() => {
  if (usuario) {
    console.log('🔍 DEBUG - Datos completos del usuario:', usuario);
    console.log('📸 DEBUG - Campo foto específico:', usuario.foto);
    console.log('🔗 DEBUG - Tipo de dato foto:', typeof usuario.foto);
    console.log('📊 DEBUG - Todos los campos:', Object.keys(usuario));
    
    // Verificar si la URL de la foto es válida
    if (usuario.foto) {
      fetch(usuario.foto, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('✅ DEBUG - URL de foto es válida y accesible');
          } else {
            console.error('❌ DEBUG - URL de foto responde con error:', response.status);
          }
        })
        .catch(error => {
          console.error('❌ DEBUG - No se puede acceder a la URL de la foto:', error);
        });
    } else {
      console.warn('⚠️ DEBUG - Campo foto está vacío o undefined');
    }
  }
}, [usuario]);

// También puedes agregar este botón temporal en la UI para ver los datos:
<button
  onClick={() => {
    console.clear();
    console.log('🔍 DATOS DEL USUARIO:');
    console.table(usuario);
    alert(JSON.stringify(usuario, null, 2));
  }}
  className="bg-purple-500 text-white px-4 py-2 rounded"
>
  Ver Datos de Usuario (Debug)
</button>
