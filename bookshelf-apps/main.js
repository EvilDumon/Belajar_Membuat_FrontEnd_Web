const bookshelf = []
const RENDER_EVENT = 'render-bookshelf'
const SEARCH_EVENT = 'search-bookshelf'
const STORAGE_KEY = 'BOOKSHELF_APPS'

function generateId() {
    return +new Date()
}

document.addEventListener(RENDER_EVENT, () => {
    const incompletedBookshelfList = document.getElementById('incompleteBookshelfList')
    incompletedBookshelfList.innerHTML = ''

    const completedBookshelfList = document.getElementById('completeBookshelfList')
    completedBookshelfList.innerHTML = ''

    for (const book of bookshelf) {
        const bookElement = createBook(book)
        if (book.isComplete) {
            completedBookshelfList.append(bookElement)
        } else {
            incompletedBookshelfList.append(bookElement)
        }
    }
})

document.addEventListener(SEARCH_EVENT, (event) => {
    const incompletedBookshelfList = document.getElementById('incompleteBookshelfList')
    incompletedBookshelfList.innerHTML = ''

    const completedBookshelfList = document.getElementById('completeBookshelfList')
    completedBookshelfList.innerHTML = ''

    const filterBookshelf = bookshelf.filter((book) => book.title == event.detail.title)
    for (const book of filterBookshelf) {
        const bookElement = createBook(book)
        if (book.isComplete) {
            completedBookshelfList.append(bookElement)
        } else {
            incompletedBookshelfList.append(bookElement)
        }
    }
})

document.addEventListener('DOMContentLoaded', () => {
    if (checkStorage) {
        loadDataFromStorage()
    }

    const form = document.getElementById('inputBook')
    form.addEventListener('submit', (Event) => {
        Event.preventDefault()
        addBook()
    })

    const searchForm = document.getElementById('searchBook')
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault()
        const titleSearched = document.getElementById('searchBookTitle').value.trim()
        const bookId = findByTitle(titleSearched)
        if (titleSearched == "") {
            loadDataFromStorage()
            console.log("TEST 1")
        } else {
            if (bookId != null) {
                for (const index in bookshelf) {
                    if (bookshelf[index].id === bookId) {
                        document.dispatchEvent(new CustomEvent(SEARCH_EVENT, {
                            detail: {
                                title: titleSearched
                            }
                        }))
                    }
                }
            } else {
                alert('Buku yang Kamu Cari Tidak Ada Pada Rak Buku')
            }
        }
    })
})

function addBook() {
    const titleField = document.getElementById('inputBookTitle').value
    const authorField = document.getElementById('inputBookAuthor').value
    const yearField = document.getElementById('inputBookYear').value
    const isCompleteField = document.getElementById('inputBookIsComplete').checked

    const bookId = generateId()
    const book = bookObject(bookId, titleField, authorField, parseInt(yearField), isCompleteField)
    bookshelf.push(book)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function bookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function createBook(bookObject) {
    const textTitle = document.createElement('h3')
    textTitle.innerText = bookObject.title

    const textAuthor = document.createElement('p')
    textAuthor.innerText = `Penulis: ${bookObject.author}`

    const textYear = document.createElement('p')
    textYear.innerText = `Tahun: ${bookObject.year}`

    const articleContainer = document.createElement('article')
    articleContainer.classList.add('book_item')
    articleContainer.setAttribute('id', `book_${bookObject.id}`)
    articleContainer.append(textTitle, textAuthor, textYear)

    const buttonRemove = document.createElement('button')
    buttonRemove.classList.add('red')
    buttonRemove.innerText = 'Hapus Buku'
    buttonRemove.addEventListener('click', () => removeBook(bookObject.id))

    const actionContainer = document.createElement('div')
    actionContainer.classList.add('action')

    if (bookObject.isComplete) {
        const buttonIncomplete = document.createElement('button')
        buttonIncomplete.classList.add('green')
        buttonIncomplete.innerText = 'Belum Selesai Dibaca'
        buttonIncomplete.addEventListener('click', () => makeUncomplete(bookObject.id))

        actionContainer.append(buttonIncomplete, buttonRemove)
    } else {
        const buttonComplete = document.createElement('button')
        buttonComplete.classList.add('green')
        buttonComplete.innerText = 'Selesai Dibaca'
        buttonComplete.addEventListener('click', () => makeComplete(bookObject.id))

        actionContainer.append(buttonComplete, buttonRemove)
    }

    articleContainer.append(actionContainer)

    return articleContainer
}

function removeBook(bookId) {
    const bookIndex = findByIndex(bookId)
    if (bookIndex != null){
        bookshelf.splice(bookIndex,1)
    }
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function makeUncomplete(bookId) {
    const bookIndex = findByIndex(bookId)
    if (bookIndex != null) {
        bookshelf[bookIndex].isComplete = false
        document.dispatchEvent(new Event(RENDER_EVENT))
        saveData()
    }
}

function makeComplete(bookId) {
    const bookIndex = findByIndex(bookId)
    if (bookIndex != null) {
        bookshelf[bookIndex].isComplete = true
        document.dispatchEvent(new Event(RENDER_EVENT))
        saveData()
    }
}

function loadDataFromStorage() {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (data != null) {
        bookshelf.splice(0, bookshelf.length)
        for (const book of data) {
            bookshelf.push(book)
            document.dispatchEvent(new Event(RENDER_EVENT))
        }
    }
}

function findByIndex(bookId) {
    for (const index in bookshelf) {
        if (bookshelf[index].id === bookId) return index
    }
    return null
}

function findByTitle(title) {
    for (const index in bookshelf) {
        if (bookshelf[index].title.includes(title)) return bookshelf[index].id
    }
    return null
}

function saveData() {
    if (checkStorage()) {
        const parsed = JSON.stringify(bookshelf)
        localStorage.setItem(STORAGE_KEY, parsed)
    }
}

function checkStorage() {
    if (typeof (Storage) === undefined) {
        alert('Browser ini tidak mendukung local storage')
        return false
    }
    return true
}